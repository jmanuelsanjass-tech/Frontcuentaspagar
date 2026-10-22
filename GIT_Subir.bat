@echo off
REM Script interactivo para subir cambios a GitHub

REM Cambiar al directorio del proyecto
cd /d "D:\NET2026\cuentas-por-pagar\Frontcuentaspagar"

REM Verificar estado del repositorio
git status

REM Agregar todos los cambios
git add .

REM Pedir mensaje de commit al usuario
set /p commitmsg=Escribe el mensaje de commit: 

REM Crear commit con el mensaje ingresado
git commit -m "%commitmsg%"

REM Subir cambios al repositorio remoto en la rama main
git push git@github.com:jmanuelsanjass-tech/Frontcuentaspagar.git main

pause
