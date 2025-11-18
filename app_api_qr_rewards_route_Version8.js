// Minimal CommonJS stub so tests can require/import this module.
exports.POST = async function (request) {
  try {
    if (request && typeof request.json === 'function') {
      const body = await request.json().catch(() => ({}));
      return { ok: true, received: body };
    }
    return { ok: true, received: {} };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
};