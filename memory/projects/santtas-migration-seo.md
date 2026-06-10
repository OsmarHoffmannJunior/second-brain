# Santtas — Checklist de Migração SEO

> Foco em SEO. Verificações técnicas e de rankings durante migração do site (Laravel legacy → novo Laravel).
> Data de lançamento: 01/05/2026.

---

## 1. Auditoria Pré-Migração

- [ ] Exportar rankings atuais do SerproBot (todas as 248 keywords)
- [ ] Exportar dados do GSC (cliques, impressões, CTR, posição por página)
- [ ] Listar todas as URLs do site atual (legacy)
- [ ] Mapear backlinks externos (ferramenta como Ahrefs/Moz)
- [ ] Verificar Domain Authority / autoridade do domínio
- [ ] Documentar CTR e posição média de cada cidade/página principal

---

## 2. Analytics & Tracking

- [ ] Google Analytics 4 — verificar se o `G-MPRZ7ZTT48` está instalado na nova versão
- [ ] Google Search Console — verificar propriedade e acesso na nova versão
- [ ] Microsoft Clarity — instalar tag Clarity na nova versão
- [ ] Facebook Pixel (se aplicável)
- [ ] Configurar Goals/Eventos importantes no GA4

---

## 3. Meta Tags & On-Page

- [ ] Title tags por cidade/página
- [ ] Meta descriptions por cidade/página
- [ ] Heading tags (H1, H2, H3) corretos
- [ ] Alt text em imagens
- [ ] Canonical tags apontando pro domínio correto
- [ ] Meta robots (index, follow)
- [ ] Open Graph tags (Facebook/OG)
- [ ] Twitter Card tags
- [ ] Schema markup LocalBusiness para cada cidade
- [ ] Schema FAQ para páginas de cidade

---

## 4. Redirecionamentos (301)

- [ ] Mapear estrutura de URLs antiga vs nova
- [ ] Criar redirecionamento 301 de cada URL antiga para a nova correspondente
- [ ] Páginas de cidade: `/acompanhantes/{uf}/{cidade}` antigo → `/acompanhantes/{uf}/{cidade}` novo (mesma estrutura?)
- [ ] Homepage e landing pages principais
- [ ] Página de usuário/dashboard
- [ ] URLs com query strings (parâmetros UTM, filtros)
- [ ] Páginas 404 customizadas
- [ ] Redirecionamento de WWW para non-WWW (ou vice-versa, conforme preferência)
- [ ] Verificar se há URLs com caracteres especiais que precisam de encode

---

## 5. Linkagem Interna

- [ ] Atualizar links internos que apontem para URLs antigas
- [ ] Verificar link entre cidades no footer
- [ ] Menu de navegação com links funcionando
- [ ] Sitemap XML gerado e submetido ao GSC
- [ ] Atualizar robots.txt para a nova versão

---

## 6. Performance & UX

- [ ] Core Web Vitals (LCP, FID, CLS) — meta: Good
- [ ] Velocidade de carregamento (mobile e desktop)
- [ ] Imagens otimizadas (WebP, lazy load)
- [ ] Mobile-first verification
- [ ] SSL/HTTPS funcionando corretamente
- [ ] Renderização de conteúdo dinâmica (JS)

---

## 7. Pós-Migração (Monitoramento)

- [ ] Verificar indexação no GSC (páginas novas indexadas)
- [ ] Monitorar CTR e posição nos primeiros 7 dias
- [ ] Verificar 404s no GSC
- [ ] Comparar tráfego orgânico pré vs pós-migração (mesmo período)
- [ ] Acompanhar backlinks — nenhum perdido?
- [ ] Testar formulários e funcionalidades críticas

---

## 8. Estrutura de Dados do Site

### URL atual (legacy)
- Base: `https://br.santtas.com/`
- Cidades: `/acompanhantes/{uf}/{cidade}`
- Landing: `/acompanhantes/{uf}/{cidade}/{slug}`
- Dashboard: `/user/dashboard`

### URL nova (Laravel)
- A confirmar com Victor Lima — estrutura nova?

---

## 9. Notas

- GSC Property: `sc-domain:br.santtas.com`
- GA Measurement ID: `G-MPRZ7ZTT48`
- SerproBot project: `1262084` (Santtas)


---

## 10. Canonical & Duplicate URLs

- [ ] Definir URL canonical (preferencialmente HTTPS)
- [ ] Implementar `<link rel="canonical">` em todas as páginas pointing para URL canonical
- [ ] Usar Redirects 301 para URLs duplicadas (forte sinal pro Google)
- [ ] Garantir que HTTP redireciona para HTTPS
- [ ] Verificar se há URLs com e sem www (escolher uma versão canonical)
- [ ] Não usar robots.txt para canonicalizar
- [ ] Não usar URL removal tool para canonicalizar
- [ ] Sitemap XML com apenas URLs canonical (não duplicatas)

---

## 11. Estrutura de URLs & Rastreamento

- [ ] Verificar se a estrutura de URLs mudou entre legacy e novo
- [ ] URLs amigáveis (friendly URLs) sem parâmetros desnecessários
- [ ] Verificar URL absoluta no canonical (não relativa)
- [ ] Hreflang — apenas se houver versões linguísticas diferentes (não se aplica ao Santtas, que é só BR)
- [ ] Verificar se há links para URLs não-canonical (consistência interna)

---

## 12. Rich Snippets & Schema Específicos

- [ ] LocalBusiness schema com endereço, telefone, horário
- [ ] FAQ schema em páginas de cidade
- [ ] AggregateRating se houver reviews
- [ ] Event schema se aplicável (eventos especiais?)
- [ ] BreadcrumbList schema nas páginas de cidade
- [ ] Verificar no Rich Results Test se os schemas estão válidos

---

## 13. SEO Local ( por Cidade)

- [ ] Google Business Profile (GBP) — verificar se está vinculado ao site correto
- [ ] Citaciones consistency (NAP: Nome, Endereço, Telefone) — mesmo em todas as plataformas
- [ ] Páginas de cidade com meta description local
- [ ] Nome da cidade no title tag, H1 e primeira linha do conteúdo
- [ ] Google Maps embed na página de cada cidade
- [ ] Reviews do GBP visíveis na página

---

## 14. Backlinks & Autoridade

- [ ] Listar todos os backlinks atuais (Ahrefs/Moz/SEMrush)
- [ ] Verificar quais backlinks apontam para URLs que vão mudar
- [ ] Solicitar atualização de backlinks quando possível (parceiros, diretórios)
- [ ] Monitorar novos backlinks depois da migração
- [ ] Verificar Domain Rating / autoridade pós-migração

---

## 15. Monitoramento Pós-Lançamento

- [ ] Google Search Console — Monitorar aba de "Páginas" (erros de cobertura)
- [ ] Monitorar "Sitemaps" no GSC — verificar se está sendo rastreado corretamente
- [ ] Alertas GSC para erros de rastreamento
- [ ] Monitorar SERP positions das 248 keywords (SerproBot API)
- [ ] Verificar trá ego orgânico no GA4 semanalmente (primeiras 4 semanas)
- [ ] Tool de monitoramento de uptime (Checkly/UptimeRobot)
- [ ] Configurar alertas de queda de tráfego

---

## 16. Ferramentas de Monitoramento

| Ferramenta | Uso |
|---|---|
| GSC | Cobertura de indexação, erros, CTR |
| SerproBot | 248 keywords positions |
| GA4 | Tráfego orgânico, eventos, convers oes |
| Microsoft Clarity | Mapas de calor, gravações |
| Ahrefs/Moz | Backlinks, Domain Rating |
| Screaming Frog | Auditoria técnica completa |
| Lighthouse / PageSpeed Insights | Core Web Vitals |
| Rich Results Test | Validação de schemas |
|GTmetrix / WebPageTest | Performance detalhada |

---

## 17. SEO Copy (Conteúdo)

- [ ] Conteúdo único por página de cidade (não genérico)
- [ ] Densidade de keyword local otimizada (sem keyword stuffing)
- [ ] CTAs locais ( telefone, WhatsApp, formulário)
- [ ] Internal linking contextual entre cidades
- [ ] UTM parameters para tracking de campanhas
- [ ] Verificar duplicação de conteúdo entre páginas de cidade


---

## 18. Decisão sobre Redirecionamentos (2026-04-20)

**Resolução:** Estrutura de URLs será mantida idêntica (legacy → novo Laravel).

- [ ] Confirmar com Victor Lima que a estrutura `/acompanhantes/{uf}/{cidade}` permanece igual
- [ ] Verificar por amostragem (抽查): checar 10-15 URLs do legacy correspondem à nova versão
- [ ] Sample de URLs a verificar:
  - `/acompanhantes/pr/londrina` (TOP 1, 56k sessões)
  - `/acompanhantes/rs/erechim` (38k sessões)
  - `/home` (81k sessões)
  - `/user/dashboard` (51k sessões)
  - `/acompanhantes/sc/joinville` (TOP 3)
  - `/acompanhantes/am/manaus` (TOP 2)
  - Página aleatória de perfil: `/acompanhantes/sp/sao-paulo`
- [ ] Garantir que links internos na versão nova pointam para URLs canonical da própria versão


---

## 19. Testes Funcionais (Fluxo Humano)

> Testes manuais simulando comportamento real de anunciante e usuário no site novo.

### Cadastro & Conta
- [ ] Fluxo de cadastro completo (email + senha)
- [ ] Receber email de boas-vindas / confirmação
- [ ] Ativar conta via link no email
- [ ] Login com credenciais corretas
- [ ] Login com credenciais incorretas (erro mostrado?)
- [ ] Logout funcional
- [ ] Recuperação de senha via email

### Gestão de Perfil / Anúncio
- [ ] Editar informações do anúncio (texto, fotos, dados)
- [ ] Alterar cidade do anúncio — verificar redirect (nova URL funciona? redireciona pra cidade certa?)
- [ ] Alterar UF do anúncio
- [ ] Ocultar anúncio (toggle de visibilidade)
- [ ] Mostrar novamente após ocultar
- [ ] Alterar plano de destaque (upgrade)
- [ ] Comprar plano de destaque (pagamento + ativação)
- [ ] Verificar se anúncio destacado aparece corretamente no topo

### Mídia (Vídeos & Rapidinhas)
- [ ] Enviar vídeo (tamanho, formato aceitos)
- [ ] Enviar rapidinha (foto curta)
- [ ] Apagar vídeo
- [ ] Apagar rapidinha
- [ ] Verificar se mídia aparece no perfil após upload
- [ ] Verificar limitação de tamanho/formato (erro adequado mostrado?)

### Remoção de Conta & Anúncio
- [ ] Remover próprio anúncio — o que acontece? (404? página generic? redirect?)
- [ ] Remover conta — aviso por email? prazo de exclusão?
- [ ] Conta removida: anúncio fica inativo ou é deletado junto?
- [ ] Conta removida: email ainda existe no sistema (não consegue recadastrar com mesmo email)

### Status de Conta
- [ ] Conta suspensa — o que é exibido ao usuário que tenta acessar?
- [ ] Conta banida — mensagem adequada? contato de suporte?
- [ ] Conta inativa (sem login) — dados permanecem por quanto tempo?

### Denúncia & Suporte
- [ ] Denunciar anúncio (fluxo: botão → formulário → confirmação)
- [ ] Denunciar anúncio — confirmação por email ao denunciante
- [ ] Denunciar — equipe interna recebe notificação?
- [ ] Contato via suporte (formulário ou email) — funciona?
- [ ] Resposta do suporte em tempo adequado

### Fluxos de Pagamento
- [ ] Comprar destaque — redirecionamento para Safe2Pay
- [ ] Retorno (webhook) — destaque ativado após pagamento?
- [ ] Cancelamento de plano — downgrade funcional?
- [ ] Reembolso — processo documentado?

### Mobile
- [ ] Cadastro pelo celular
- [ ] Upload de mídia via mobile
- [ ] Navegação entre cidades no mobile
- [ ] Login/logout no mobile

---

## 20. Itens a Adicionar (Pendente)

> Lista de ideias ainda não formatadas — vai crescendo.

- [ ] Testar busca interna do site
- [ ] Testar filtro por cidade/UF
- [ ] Verificar se mapa do Google funciona em cada página de cidade
- [ ] Testar compartilhamento em redes sociais (Facebook, WhatsApp)
- [ ] Testar deep link em apps (iOS/Android)

