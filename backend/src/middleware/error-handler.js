export function notFoundHandler(req, res, next) {
  res.status(404).json({
    error: 'NotFound',
    message: 'Rota não encontrada'
  });
  next();
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Erro interno inesperado';

  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(status).json({
    error: err.code || 'InternalError',
    message
  });
}
