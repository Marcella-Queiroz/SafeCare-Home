# Teste da Funcionalidade de Compartilhamento

## Passos para Testar:

### 1. Preparação
- [ ] Ter dois usuários cadastrados (Usuário A e Usuário B)
- [ ] Fazer login com Usuário A

### 2. Criação de Paciente (Usuário A)
- [ ] Acessar página de pacientes
- [ ] Clicar em "Adicionar Paciente"
- [ ] Preencher dados incluindo CPF (ex: 123.456.789-00)
- [ ] Salvar paciente
- [ ] Verificar se paciente aparece na lista SEM chip "Compartilhado"

### 3. Compartilhamento (Usuário B)
- [ ] Fazer logout e login com Usuário B
- [ ] Acessar página de pacientes
- [ ] Clicar em "Adicionar Paciente"
- [ ] Buscar pelo CPF do paciente criado por A
- [ ] Verificar se modal encontra o paciente
- [ ] Adicionar paciente à lista
- [ ] Verificar se paciente aparece COM chip "Compartilhado" azul

### 4. Verificação da Ficha
- [ ] Clicar no paciente compartilhado
- [ ] Verificar se na ficha aparece "Paciente compartilhado com: [Nome do Usuário A]"

### 5. Verificação do Criador Original
- [ ] Fazer logout e login novamente com Usuário A
- [ ] Acessar a ficha do paciente original
- [ ] Verificar se aparece "Paciente cadastrado por: [Nome do Usuário A]"

## Problemas Potenciais a Verificar:

1. **CPF não encontrado**: Verificar se função `findPatientByCPFGlobal` está funcionando
2. **Chip não aparece**: Verificar se propriedade `shared` está sendo definida
3. **Nome não aparece**: Verificar se função `getUserNameById` está funcionando
4. **Erro de permissão**: Verificar se `grantPatientAccess` está funcionando

## Console Logs Úteis:
- Abrir DevTools (F12) e verificar console para erros
- Logs de busca e compartilhamento devem aparecer
