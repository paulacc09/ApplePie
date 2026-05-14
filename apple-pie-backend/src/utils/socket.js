const { Server } = require('socket.io');

let ioInstance;

const initSocket = (server) => {
  ioInstance = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  ioInstance.on('connection', (socket) => {
    socket.on('unirse_comunidad', (payload) => {
      const { comunidadId } = payload || {};
      if (comunidadId == null) return;
      socket.join('comunidad_' + comunidadId);
    });

    socket.on('nuevo_mensaje', (payload) => {
      const { comunidadId, mensaje, usuarioId, nombre } = payload || {};
      if (comunidadId == null) return;
      ioInstance.to('comunidad_' + comunidadId).emit('mensaje_recibido', {
        mensaje,
        usuarioId,
        nombre,
        timestamp: new Date(),
      });
    });

    socket.on('registrar_usuario', (payload) => {
      const { usuarioId } = payload || {};
      if (usuarioId == null) return;
      socket.join('usuario_' + usuarioId);
    });

    socket.on('disconnect', () => {
      console.log(socket.id);
    });
  });
};

const notificarUsuario = (io, usuarioId, datos) => {
  const sio = io || ioInstance;
  if (!sio) return;
  sio.to('usuario_' + usuarioId).emit('nueva_notificacion', datos);
};

module.exports = { initSocket, notificarUsuario };
