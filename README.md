<div align="center">

# It Looks Like Zimoun

**Série "It Looks Like..." · NICS/UNICAMP · 2026**

[![GitHub Pages](https://img.shields.io/badge/demo-live-c8a04a?style=flat-square&logo=github)](https://seu-usuario.github.io/it-looks-like-zimoun/)
[![License](https://img.shields.io/badge/license-CC%20BY--NC--SA%204.0-4a7090?style=flat-square)](LICENSE)
[![NICS](https://img.shields.io/badge/NICS-UNICAMP-6a5a3a?style=flat-square)](https://nics.unicamp.br)
[![Web Audio](https://img.shields.io/badge/Web%20Audio%20API-native-8a7a5a?style=flat-square)]()

<br>

*"No meu trabalho de instalação, o que você ouve é o que você vê,*  
*e o que você vê é o que você ouve."*  
— **Zimoun**

<br>

[🇧🇷 Português](#-português) · [🇺🇸 English](#-english)

</div>

---

## 🇧🇷 Português

### Sobre a obra

**It Looks Like Zimoun** é uma instalação sonora interativa navegável em primeira pessoa, desenvolvida como parte da série **"It Looks Like..."** do NICS/UNICAMP. A obra traduz para o ambiente digital o universo sensorial do artista suíço **Zimoun** — motores, materiais industriais, objetos suspensos por cordas que vibram, ressoam e pulsam em assincronia deliberada.

O visitante caminha por um espaço tridimensional habitado por objetos geométricos suspensos em cordas com física de pêndulo real. Cada objeto produz um som sintetizado em tempo real de acordo com seu material — papel, madeira, vidro, metal, pedra ou borracha. A posição do visitante e o balanço dos pêndulos modulam a espacialização sonora continuamente, criando uma textura sempre em transformação.

### Sobre Zimoun

[**Zimoun**](https://www.zimoun.net) (Berna, Suíça, 1977) é um dos artistas sonoros mais reconhecidos da cena contemporânea. Suas instalações de grande escala utilizam materiais industriais simples — motores DC, papelão, arame, madeira, algodão, metal — montados em repetição e ativados mecanicamente para produzir ambientes sonoros orgânicos, imprevisíveis e hipnóticos.

O princípio central de seu trabalho é a **"complexidade primitiva"**: sistemas simples que, em repetição com variações microscópicas, geram comportamentos impossíveis de prever. Cada motor está conectado à mesma corrente elétrica, mas como cada componente é feito à mão, nenhum sincroniza exatamente com outro. O caos emerge da ordem.

Zimoun concebe suas instalações como **composições musicais** sem intervir ativamente no desenvolvimento do som — os sistemas têm autonomia. Ele chama seus materiais de *"materiais honestos"*: objetos industriais que não pretendem ser outra coisa além do que são.

📺 [Assistir instalações no YouTube](https://www.youtube.com/results?search_query=zimoun+sound+installation)  
🎞 [Vimeo — Studio Zimoun](https://vimeo.com/zimoun)  
📖 [Wikipedia PT](https://pt.wikipedia.org/wiki/Zimoun)  
🌐 [zimoun.net](https://www.zimoun.net)

### Demo

🔗 **[Acessar a instalação online →](https://seu-usuario.github.io/it-looks-like-zimoun/)**

> Melhor experiência: **Chrome ou Firefox** no desktop, com fones de ouvido.

### Série "It Looks Like..."

Esta obra faz parte de uma série de implementações web interativas de obras fundamentais da arte sonora experimental, desenvolvidas no **NICS/UNICAMP** pelo Prof. Ivan Simurra.

| Obra | Artista | Ano | Status |
|---|---|---|---|
| It Looks Like I Am Sitting in a Room | Alvin Lucier (1969) | 2025 | ✅ Disponível |
| **It Looks Like Zimoun** | Zimoun (2000–presente) | 2026 | ✅ Disponível |
| It Looks Like In C | Terry Riley (1964) | 2026 | 🔄 Em desenvolvimento |
| It Looks Like Pendulum Music | Steve Reich (1968) | 2026 | 📋 Planejada |
| It Looks Like Music of Changes | John Cage (1951) | 2026 | 📋 Planejada |

### Como usar

#### Controles

| Ação | Tecla / Gesto |
|---|---|
| Mover | `W` `A` `S` `D` ou setas |
| Girar câmera | Arrastar o mouse |
| Ativar / silenciar objeto | Click rápido |
| Lançar pêndulo | Click longo + arrastar |
| Ajustar frequência | Scroll do mouse |
| **Pausar e abrir painel** | `Tab` ou `P` |
| Misturar materiais | `M` (com objeto na mira) |
| Toggle painel lateral | `H` |
| Painel informativo | `I` |

> **Como acessar o painel lateral:** pressione `Tab` ou `P` para entrar no **Modo Pausa**. O mouse fica livre e o painel da direita torna-se completamente interativo. Clique no canvas ou em "▶ Retomar" para voltar à exploração.

#### Painel de controles
- **Tema Visual** — 5 paletas: Escuro, Claro, Ciano, Âmbar, Branco
- **Espaço Acústico** — 5 ambientes com reverb convolution sintético
- **Wet/Dry** — proporção do reverb
- **Densidade** — 8 a 500 objetos no espaço
- **Materiais Ativos** — filtrar tipos de objeto
- **Volume** e **Distância de Audição**

### Como executar localmente

ES6 modules exigem um servidor HTTP local — não abre com `file://`.

```bash
# Python (pré-instalado no macOS e Linux)
cd it-looks-like-zimoun
python -m http.server 8000
# Abrir: http://localhost:8000

# Node.js
npx serve .

# VS Code: instalar extensão "Live Server" → clicar em "Go Live"
```

> ⚠️ **p5.js Web Editor** não é compatível: não suporta ES6 modules multi-arquivo.

### Deploy no GitHub Pages

```bash
git init
git add .
git commit -m "feat: It Looks Like Zimoun — instalação sonora interativa"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/it-looks-like-zimoun.git
git push -u origin main
# GitHub → Settings → Pages → Branch: main → / (root) → Save
```

### Arquitetura técnica

```
it-looks-like-zimoun/
├── index.html      ← Entrada única: HTML + CSS completo
├── main.js         ← Orquestrador: loop, eventos, modos
├── synth.js        ← Síntese Web Audio API + reverb convolution
├── world.js        ← Objetos, pêndulo físico, voice pooling
├── sketch.js       ← Raycaster 3D, render, minimap, temas
├── spatial.js      ← Player, câmera, modos explorar/pausa
└── ui.js           ← Painéis, temas, mix, info, tooltips
```

#### Síntese por material

| Material | Técnica | Caráter sonoro |
|---|---|---|
| Papel | Ruído branco filtrado + LFO | Sussurrante, etéreo |
| Madeira | 2 osciladores inarmônicos + BPF | Modal, seco, percussivo |
| Vidro | 4 sinusoides + shimmer LFO | Brilhante, longo, transparente |
| Metal | FM synthesis com razões irracionais | Metálico, parciais inarmônicas |
| Pedra | Noise burst comprimido + LPF | Pesado, impacto abafado |
| Borracha | Sawtooth + LPF modulado | Elástico, muffled |

#### Voice Pooling
Com centenas de objetos visuais, apenas os **30 mais próximos** recebem vozes de áudio sintetizadas. Os demais existem visualmente mas consomem zero CPU de síntese. Isso permite até 500 objetos com desempenho estável.

#### Espaços acústicos (IRs sintéticas)

| Espaço | Duração IR | Caráter |
|---|---|---|
| Anecoico | 0.15s | Seco, sem reflexões |
| Sala pequena | 0.80s | Madeira, íntimo |
| Câmara de pedra | 3.20s | Catedral, muito difuso |
| Corredor metálico | 1.80s | Reflexões precoces fortes |
| Espaço aberto | 1.20s | Suave, pouco reverb |

### Créditos

**Desenvolvimento e concepção**  
Prof. Ivan Simurra — NICS/UNICAMP, 2026

**Referência artística**  
Zimoun — [zimoun.net](https://www.zimoun.net)

**Série "It Looks Like..."**  
Núcleo Interdisciplinar de Comunicação Sonora  
[nics.unicamp.br](https://nics.unicamp.br)

**Referências bibliográficas**
- Zimoun. *Sound Sculptures & Installations*. Studio Zimoun, Berna. https://www.zimoun.net
- Roads, C. *Microsound*. MIT Press, 2001.
- Wishart, T. *On Sonic Art*. Harwood Academic Publishers, 1996.
- Zölzer, U. *DAFX: Digital Audio Effects*. Wiley, 2011.

---

## 🇺🇸 English

### About the work

**It Looks Like Zimoun** is a navigable first-person interactive sound installation, developed as part of the **"It Looks Like..."** series at NICS/UNICAMP. The work translates into a digital environment the sensorial universe of Swiss artist **Zimoun** — motors, industrial materials, objects suspended by strings that vibrate, resonate and pulse in deliberate asynchrony.

The visitor walks through a three-dimensional space inhabited by geometric objects suspended on strings with real pendulum physics. Each object produces a sound synthesized in real time according to its material — paper, wood, glass, metal, stone or rubber. The visitor's position and the pendulum swings continuously modulate the sonic spatialization, creating an ever-transforming texture.

### About Zimoun

[**Zimoun**](https://www.zimoun.net) (Bern, Switzerland, 1977) is one of the most recognized sound artists of the contemporary scene. His large-scale installations use simple industrial materials — DC motors, cardboard, wire, wood, cotton, metal — assembled in repetition and mechanically activated to produce organic, unpredictable and hypnotic sonic environments.

The central principle of his work is **"primitive complexity"**: simple systems that, through repetition with microscopic variations, generate unpredictable behaviors. Each motor is connected to the same electrical current, but since each component is handmade, none synchronizes exactly with another. Chaos emerges from order.

Zimoun conceives his installations as **musical compositions** without actively intervening in the development of sound — the systems have autonomy. He calls his materials *"honest materials"*: industrial objects that make no pretense of being anything other than what they are.

📺 [Watch installations on YouTube](https://www.youtube.com/results?search_query=zimoun+sound+installation)  
🎞 [Vimeo — Studio Zimoun](https://vimeo.com/zimoun)  
📖 [Wikipedia EN](https://en.wikipedia.org/wiki/Zimoun)  
🌐 [zimoun.net](https://www.zimoun.net)

### Demo

🔗 **[Access the installation online →](https://seu-usuario.github.io/it-looks-like-zimoun/)**

> Best experience: **Chrome or Firefox** on desktop with headphones.

### The "It Looks Like..." Series

This work is part of a series of interactive web implementations of foundational works in experimental sound art, developed at **NICS/UNICAMP** by Prof. Ivan Simurra.

| Work | Artist | Year | Status |
|---|---|---|---|
| It Looks Like I Am Sitting in a Room | Alvin Lucier (1969) | 2025 | ✅ Available |
| **It Looks Like Zimoun** | Zimoun (2000–present) | 2026 | ✅ Available |
| It Looks Like In C | Terry Riley (1964) | 2026 | 🔄 In development |
| It Looks Like Pendulum Music | Steve Reich (1968) | 2026 | 📋 Planned |
| It Looks Like Music of Changes | John Cage (1951) | 2026 | 📋 Planned |

### How to use

#### Controls

| Action | Key / Gesture |
|---|---|
| Move | `W` `A` `S` `D` or arrow keys |
| Rotate camera | Mouse drag |
| Activate / mute object | Quick click |
| Launch pendulum | Long click + drag |
| Adjust frequency | Mouse scroll |
| **Pause and open panel** | `Tab` or `P` |
| Mix materials | `M` (with object in crosshair) |
| Toggle side panel | `H` |
| Info panel | `I` |

> **How to access the side panel:** press `Tab` or `P` to enter **Pause Mode**. The mouse becomes free and the right panel becomes fully interactive. Click the canvas or "▶ Resume" to return to exploration.

### How to run locally

```bash
# Python
cd it-looks-like-zimoun
python -m http.server 8000
# Open: http://localhost:8000

# Node.js
npx serve .

# VS Code: install "Live Server" extension → click "Go Live"
```

### Deploy to GitHub Pages

```bash
git init && git add . && git commit -m "feat: It Looks Like Zimoun"
git branch -M main
git remote add origin https://github.com/YOUR-USER/it-looks-like-zimoun.git
git push -u origin main
# GitHub → Settings → Pages → Branch: main → / (root) → Save
```

### Technical Architecture

```
it-looks-like-zimoun/
├── index.html      ← Single entry: HTML + CSS
├── main.js         ← Orchestrator: loop, events, modes
├── synth.js        ← Web Audio synthesis + convolution reverb
├── world.js        ← Objects, pendulum physics, voice pooling
├── sketch.js       ← 3D Raycaster, render, minimap, themes
├── spatial.js      ← Player, camera, explore/pause modes
└── ui.js           ← Panels, themes, mix, info, tooltips
```

### Credits

**Development and conception**  
Prof. Ivan Simurra — NICS/UNICAMP, 2026

**Artistic reference**  
Zimoun — [zimoun.net](https://www.zimoun.net)

**"It Looks Like..." Series**  
Núcleo Interdisciplinar de Comunicação Sonora  
[nics.unicamp.br](https://nics.unicamp.br)

---

### License / Licença

[![CC BY-NC-SA 4.0](https://licensebuttons.net/l/by-nc-sa/4.0/88x31.png)](LICENSE)

**PT:** Disponibilizado para fins educacionais e de pesquisa artística.  
A referência à obra de Zimoun é de caráter educativo e crítico.  
© 2026 NICS/UNICAMP · Prof. Ivan Simurra

**EN:** Made available for educational and artistic research purposes.  
The reference to Zimoun's work is of an educational and critical nature.  
© 2026 NICS/UNICAMP · Prof. Ivan Simurra
