# Seguridad del backend de demostración

Este proyecto utiliza Firebase Authentication anónimo y Cloud Firestore únicamente para demostrar el flujo comercial entre un residente y el personal de seguridad.

## Alcance de las reglas

- Toda operación requiere una sesión autenticada, aunque sea anónima.
- Las autorizaciones se consultan individualmente por código; Seguridad no descarga la colección completa.
- El residente solo puede listar autorizaciones creadas por su UID anónimo.
- No se permiten eliminaciones de autorizaciones ni eventos.
- La cancelación conserva el documento y limita los campos modificables.
- La confirmación de entrada limita las transiciones, la vigencia y el contador de usos.
- Cada entrada se registra en `demo_access_events` dentro de la misma transacción que actualiza la autorización.
- Cualquier colección no declarada queda denegada por defecto.

## Limitación deliberada

Authentication anónimo no representa roles reales ni permite distinguir de forma confiable entre residentes y guardias. Para que dos dispositivos anónimos puedan completar la demostración, cualquier sesión anónima autenticada puede obtener una autorización por su código opaco y confirmar una entrada bajo las transiciones estrictas de las reglas.

Estas reglas son exclusivamente para una demo pública. No representan las reglas de autorización, identidad, auditoría ni seguridad del sistema productivo futuro.
