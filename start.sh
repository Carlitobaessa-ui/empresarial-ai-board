#!/usr/bin/env bash
# Sobe backend e frontend juntos com um unico comando.
# Uso:  bash start.sh
set -e
cd "$(dirname "$0")"

if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
  echo "-> Criado backend/.env. Edite esse arquivo e coloque sua ANTHROPIC_API_KEY"
  echo "   antes de conversar com os agentes (sem ela o resto do app funciona normalmente,"
  echo "   so as respostas de IA nao vao sair)."
  echo ""
fi

if [ ! -d backend/node_modules ]; then
  echo "-> Instalando dependencias do backend (primeira vez)..."
  (cd backend && npm install)
fi

if [ ! -d frontend/node_modules ]; then
  echo "-> Instalando dependencias do frontend (primeira vez)..."
  (cd frontend && npm install)
fi

echo "-> Subindo backend em http://localhost:4000 ..."
(cd backend && npm run dev) &
BACKEND_PID=$!

echo "-> Subindo frontend em http://localhost:5173 ..."
(cd frontend && npm run dev) &
FRONTEND_PID=$!

trap "echo; echo 'Encerrando...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT INT TERM

sleep 2
echo ""
echo "================================================================"
echo " Pronto! Abra no navegador: http://localhost:5173"
echo " (Ctrl+C aqui encerra os dois servidores)"
echo "================================================================"

wait
