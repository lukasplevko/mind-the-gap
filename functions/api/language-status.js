export const onRequestGet=({env})=>Response.json({available:Boolean(env.MISTRAL_API_KEY)},{headers:{'Cache-Control':'no-store'}});
