# Acesso via git (Cowork)

Este repositório tem uma Deploy Key SSH (write access) configurada em
Settings → Deploy Keys, permitindo que o assistente Cowork clone e faça
push diretamente via `git`, sem precisar do editor web do GitHub.

- A chave privada correspondente vive apenas no sandbox da sessão do
  assistente e não é persistida em nenhum lugar.
- Se a chave precisar ser revogada, remova-a em Settings → Deploy Keys.
