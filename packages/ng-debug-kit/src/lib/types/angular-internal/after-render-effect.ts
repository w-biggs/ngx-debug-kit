/** @format */

import type { SignalNode } from '@angular/core/primitives/signals';
import type { EffectCleanupRegisterFn } from '@angular/core';

/**
 * Partial mirror of Angular's AfterRenderPhaseEffectNode interface containing the fields used by this library.
 * @version 21.2.0
 * @see {@link https://github.com/angular/angular/blob/v21.2.0/packages/core/src/render3/reactivity/after_render_effect.ts#L50}
 */
type AfterRenderPhaseEffectHook = (
	// Either a cleanup function or a pipelined value and a cleanup function
	...args:
		| [onCleanup: EffectCleanupRegisterFn]
		| [previousPhaseValue: unknown, onCleanup: EffectCleanupRegisterFn]
) => unknown;

/**
 * Partial mirror of Angular's AfterRenderPhaseEffectNode interface containing the fields used by this library.
 * @version 21.2.0
 * @see {@link https://github.com/angular/angular/blob/v21.2.0/packages/core/src/render3/reactivity/after_render_effect.ts#L63}
 */
export interface PartialAfterRenderPhaseEffectNode extends SignalNode<unknown> {
	phase: number;
	sequence: PartialAfterRenderEffectSequence;
	userFn: AfterRenderPhaseEffectHook;
}

/**
 * Partial mirror of Angular's AfterRenderEffectSequence class containing the fields used by this library.
 * @version 21.2.0
 * @see {@link https://github.com/angular/angular/blob/v21.2.0/packages/core/src/render3/reactivity/after_render_effect.ts#L162}
 */
export interface PartialAfterRenderEffectSequence {
	nodes: [
		PartialAfterRenderPhaseEffectNode?,
		PartialAfterRenderPhaseEffectNode?,
		PartialAfterRenderPhaseEffectNode?,
		PartialAfterRenderPhaseEffectNode?
	];
}
