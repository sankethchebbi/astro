import type { SSRResult } from '../../@types/astro';
import { markHTMLString } from './escape.js';

const animations = {
	'slide': {
		old: '--astro-animate-old-slideout',
		new: '--astro-animate-new-slidein',
		backOld: '--astro-animate-back-old-slideout-names',
		backNew: '--astro-animate-back-new-slideout-names',
	},
	'fade': {
		old: '--astro-animate-old-fade',
		new: '--astro-animate-new-fade',
	}
};

const transitionNameMap = new WeakMap<SSRResult, number>();
function incrementTransitionNumber(result: SSRResult) {
	let num = 1;
	if(transitionNameMap.has(result)) {
		num = transitionNameMap.get(result)! + 1;
	}
	transitionNameMap.set(result, num);
	return num;
}

function createTransitionScope(result: SSRResult, hash: string) {
	const num = incrementTransitionNumber(result);
	return `astro-${hash}-${num}`;
}
export function renderTransition(result: SSRResult, hash: string, animationName: string | undefined, transitionName: string) {
	// Default animation is morph
	if(!animationName) {
		animationName = "morph";
	}
	const animation = animations[animationName as keyof typeof animations];

	const scope = createTransitionScope(result, hash);

	// Default transition name is the scope of the element, ie HASH-1
	if(!transitionName) {
		transitionName = scope;
	}

	const styles = markHTMLString(`<style>[data-astro-transition-scope="${scope}"] {
		view-transition-name: ${transitionName};
	}
	${animationName === 'morph' ? '' : `
	::view-transition-old(${transitionName}) {
		animation: var(${animation.old});
	}
	::view-transition-new(${transitionName}) {
		animation: var(${animation.new});
	}
	
	${('backOld' in animation) && ('backNew' in animation) ? `
	.astro-back-transition::view-transition-old(${transitionName}) {
		animation-name: var(${animation.backOld});
	}
	.astro-back-transition::view-transition-new(${transitionName}) {
		animation-name: var(${animation.backNew});
	}
	`.trim() : ''}
	
	`.trim()}
	</style>`)

	result.extraHead.push(styles);

	return scope;
}
