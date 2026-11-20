import {checkLanguage} from '../../worker/language.js';
export const onRequestPost=ctx=>checkLanguage(ctx.request,ctx.env);
