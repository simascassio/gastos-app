# 📱 Controle de Gastos — Como Colocar no Ar

Siga estes passos com calma. São só 3 etapas e leva ~15 minutos.

---

## ETAPA 1 — Criar o banco de dados (Supabase)

1. Acesse **supabase.com** e crie uma conta gratuita
2. Clique em **"New Project"**
   - Dê um nome (ex: "gastos")
   - Escolha uma senha (guarde ela)
   - Região: **South America (São Paulo)**
   - Clique em **"Create new project"** e aguarde ~2 minutos
3. No menu lateral, clique em **"SQL Editor"**
4. Clique em **"New query"**
5. Abra o arquivo `CRIAR_TABELA_SUPABASE.sql`, copie tudo e cole no editor
6. Clique em **"Run"** — deve aparecer "Success"

---

## ETAPA 2 — Conectar o app ao banco

1. No Supabase, vá em **Settings → API** (menu lateral)
2. Você verá dois valores importantes:
   - **Project URL** → algo como `https://xyzabc.supabase.co`
   - **anon public key** → uma chave longa começando com `eyJ...`
3. Abra o arquivo `src/supabase.js` no seu editor de texto
4. Substitua os valores:
   ```
   const SUPABASE_URL = 'COLE_SUA_URL_AQUI'
   const SUPABASE_ANON_KEY = 'COLE_SUA_CHAVE_AQUI'
   ```
   Por exemplo:
   ```
   const SUPABASE_URL = 'https://xyzabc.supabase.co'
   const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
   ```
5. Salve o arquivo

---

## ETAPA 3 — Hospedar o app (Vercel)

1. Acesse **vercel.com** e crie uma conta gratuita (pode usar o Google)
2. Clique em **"Add New → Project"**
3. Clique em **"Import Git Repository"**
   - Se não tiver o código no GitHub ainda:
     - Acesse **github.com**, crie conta gratuita
     - Crie um repositório novo (ex: "gastos-app")
     - Faça upload de todos os arquivos da pasta `gastos-app`
4. Selecione o repositório e clique em **"Deploy"**
5. Aguarde ~2 minutos — o Vercel vai gerar um link tipo:
   **`https://gastos-app-xyz.vercel.app`**

---

## ✅ Pronto!

Mande o link para o seu irmão. No celular Android:
- Abrir o link no **Chrome**
- Tocar nos **três pontinhos** (menu)
- Selecionar **"Adicionar à tela inicial"**
- Vai aparecer como um app normal! 📱

No iPhone (Safari):
- Abrir o link no **Safari**
- Tocar no botão de **compartilhar** (quadrado com seta)
- Selecionar **"Adicionar à tela de início"**

---

## 💾 Sobre os dados

- Os gastos ficam salvos no **Supabase (nuvem)**
- Se o irmão trocar de celular, os dados continuam lá
- O plano gratuito do Supabase suporta até **500MB** — o suficiente para anos de uso
- Cada celular é identificado automaticamente, sem precisar de login

---

## ❓ Dúvidas?

Se travar em algum passo, é só perguntar!
