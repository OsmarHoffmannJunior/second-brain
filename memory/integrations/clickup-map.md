# ClickUp — Hoff Consultoria

## Credenciais
- **API Token:** `pk_55086979_PU3CKREB0NR3VVJQIFAQ687M6BKETA3D`
- **Workspace ID:** `9007105439` (Hoff Consultoria)
- **Space:** Projetos `90070235527`

## Estrutura de Spaces/Folders/Lists

```
Space: Projetos (90070235527)
├── Folder: Backlog (90178337370)
│   └── Backlog Geral (901713135307)
├── Folder: Santtas (90178337374)
│   ├── SEO (901713135308)
│   └── Conteúdo (901713135311)
└── Folder: Operações (90178337379)
    ├── Admin (901713135317)
    ├── Financeiro (901713135318)
    └── Comercial (901713135319)
```

## Regra de Workflow
- **Backlog** = status inicial de toda task
- Task nasce em Backlog dentro da List do cliente
- Pode ter due_date (data de vencimento)
- Sem folder/lista separada de Backlog

## Status Workflow (a configurar na UI)
```
Backlog → Em Progresso → Revisão → Bloqueado → Feito
```

## Tags
- `precisa-cliente`
- `seo`
- `conteúdo`

## Formato de Solicitação
```
/nova task [descrição] na [Lista]
/nova task [descrição] na [Lista] com prazo [data]
```

## Regras de Operação
- Clara NÃO deleta Spaces, Folders ou Tasks via API
- Apenas cria, move e edita quando solicitado

