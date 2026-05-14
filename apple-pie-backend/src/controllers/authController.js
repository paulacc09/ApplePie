const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const pool = require('../config/db');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const register = async (req, res) => {
  const { nombre, apellido, email, password } = req.body;

  if (!nombre || !apellido || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ error: 'Formato de email inválido' });
  }

  try {
    const [existing] = await pool.query(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const rol = 'estudiante';

    const [result] = await pool.query(
      'INSERT INTO usuarios (nombre, apellido, email, password_hash, rol) VALUES (?, ?, ?, ?, ?)',
      [nombre, apellido, email, passwordHash, rol]
    );

    return res.status(201).json({
      message: 'Usuario registrado',
      usuario: {
        id: result.insertId,
        nombre,
        apellido,
        email,
        rol,
      },
    });
  } catch (err) {
    console.error('Error en register:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y password son obligatorios' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, nombre, apellido, email, password_hash, rol, foto_perfil, activo FROM usuarios WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const usuario = rows[0];

    if (!usuario.activo) {
      return res.status(403).json({ error: 'Cuenta desactivada' });
    }

    const passwordOk = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordOk) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol,
        nombre: usuario.nombre,
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.status(200).json({
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol,
        foto_perfil: usuario.foto_perfil,
      },
    });
  } catch (err) {
    console.error('Error en login:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const generarMFA = async (req, res) => {
  try {
    const secreto = speakeasy.generateSecret({
      name: `ApplePie (${req.usuario.email})`,
    });

    await pool.query('UPDATE usuarios SET mfa_secreto = ? WHERE id = ?', [
      secreto.base32,
      req.usuario.id,
    ]);

    const qr = await qrcode.toDataURL(secreto.otpauth_url);

    return res.status(200).json({ qr, secreto: secreto.base32 });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const verificarMFA = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT mfa_secreto FROM usuarios WHERE id = ?',
      [req.usuario.id]
    );

    if (rows.length === 0 || !rows[0].mfa_secreto) {
      return res.status(400).json({ error: 'Primero genera el MFA' });
    }

    const valido = speakeasy.totp.verify({
      secret: rows[0].mfa_secreto,
      encoding: 'base32',
      token: req.body.token,
      window: 1,
    });

    if (!valido) {
      return res.status(400).json({ error: 'Código incorrecto' });
    }

    await pool.query('UPDATE usuarios SET mfa_habilitado = 1 WHERE id = ?', [
      req.usuario.id,
    ]);

    return res.status(200).json({ message: 'MFA habilitado correctamente' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const validarMFA = async (req, res) => {
  try {
    const { usuarioId, token } = req.body;

    const [rows] = await pool.query(
      'SELECT id, email, nombre, mfa_secreto, mfa_habilitado, rol FROM usuarios WHERE id = ?',
      [usuarioId]
    );

    if (rows.length === 0 || !rows[0].mfa_habilitado) {
      return res.status(400).json({ error: 'MFA no está habilitado' });
    }

    const usuario = rows[0];

    const valido = speakeasy.totp.verify({
      secret: usuario.mfa_secreto,
      encoding: 'base32',
      token,
      window: 1,
    });

    if (!valido) {
      return res.status(401).json({ error: 'Código MFA incorrecto' });
    }

    const jwtToken = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol,
        nombre: usuario.nombre,
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.status(200).json({ message: 'MFA validado', token: jwtToken });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  register,
  login,
  generarMFA,
  verificarMFA,
  validarMFA,
};
