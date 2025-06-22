document.addEventListener('DOMContentLoaded', function () {
  const params = new URLSearchParams(window.location.search);
  const rol = params.get('rol');
  const title = document.getElementById('role-title');
  if (rol === 'estudiante') {
    title.textContent = 'Ingreso para Estudiante';
  } else if (rol === 'profesor') {
    title.textContent = 'Ingreso para Profesor';
  }
});
