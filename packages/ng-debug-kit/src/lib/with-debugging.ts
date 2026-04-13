/** @format */

import type { ComputationFn, LinkedSignalNode } from '@angular/core/primitives/signals';
import {
	PartialAfterRenderEffectSequence,
	PartialAfterRenderPhaseEffectNode
} from './types/angular-internal/after-render-effect';

interface ProducerSummary {
	value: unknown;
	version: number;
	lastReadVersion: number;
	changed: boolean;
	producer: LinkedSignalNode<unknown, unknown>;
}

const getProducers = (effectNode: PartialAfterRenderPhaseEffectNode) => {
	// Walk the linked list of producers
	let edge = effectNode.producers;

	const effectProducers: ProducerSummary[] = [];

	while (edge) {
		const producer = edge.producer as LinkedSignalNode<unknown, unknown>;
		effectProducers.push({
			value: producer.value,
			version: producer.version,
			lastReadVersion: edge.lastReadVersion,
			changed: producer.version !== edge.lastReadVersion,
			producer: producer // expand this to identify the signal
		});
		edge = edge.nextProducer;
	}

	return effectProducers;
};

export const withDebugging = (afterRenderRef: PartialAfterRenderEffectSequence) => {
	// Get the node (whichever way you're accessing it)
	// we only care about mixedreadwrite
	const nodes = afterRenderRef.nodes;

	for (const node of nodes) {
		if (node) {
			patchUserFn(node, afterRenderRef);
		}
	}
};

const patchUserFn = (
	node: PartialAfterRenderPhaseEffectNode,
	sequence: PartialAfterRenderEffectSequence
) => {
	const originalFn = node.userFn;

	const allProducerValues = new Map<
		ComputationFn<unknown, unknown>,
		{ rawValue: unknown; clonedValue: unknown }
	>();

	node.userFn = function (...args) {
		const effectProducers = getProducers(node);

		const changedProducers = effectProducers.filter((producer) => producer.changed);

		const runCause = changedProducers.length ? 'signal update' : 'initial run';

		console.log(`[Effect Debug] Effect run due to ${runCause}:`, sequence);
		console.log('[Effect Debug] Producers: ', effectProducers);

		for (const changedProducer of changedProducers) {
			const oldValues = allProducerValues.get(changedProducer.producer.computation);
			const newValue = changedProducer.value;

			const valuesEqual = JSON.stringify(oldValues?.clonedValue) === JSON.stringify(newValue);
			const referencesEqual = oldValues?.rawValue === newValue;

			console.log(`[Effect Debug] Producer changed: `, {
				oldValue: oldValues?.clonedValue,
				newValue,
				valuesEqual,
				referencesEqual,
				producer: changedProducer
			});
		}

		const returnValue = originalFn.apply(this, args);

		const afterEffectProducers = getProducers(node);
		console.log('[Effect Debug] Producers after run: ', afterEffectProducers);

		for (const producer of afterEffectProducers) {
			const rawValue = producer.producer?.value;
			let clonedValue;
			try {
				clonedValue = structuredClone(rawValue);
			} catch (error) {
				console.warn(
					'[Effect Debug] Failed to clone value for producer: ',
					error,
					rawValue
				);
			}
			allProducerValues.set(producer.producer.computation, {
				rawValue,
				clonedValue
			});
		}

		return returnValue;
	};
};
