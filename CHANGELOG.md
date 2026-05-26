# Changelog

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).  
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.0.0] — 2026-01

### Adicionado / Added
- Instalação navegável em primeira pessoa com raycasting 3D puro (Canvas 2D)
- Síntese em tempo real via Web Audio API para 6 materiais: papel, madeira, vidro, metal, pedra, borracha
- Física de pêndulo por objeto com assincronia estrutural
- Cordas com catenária aproximada (curva de seno)
- Espacialização: StereoPannerNode com distância + ângulo + offset de pêndulo
- Reverb convolution com 5 IRs sintéticas geradas algoritmicamente
- Mistura de até 3 materiais por objeto com pesos independentes
- Anel visual de mistura ao redor de cada forma geométrica
- Voice pooling: até 30 vozes de áudio com suporte a 500+ objetos visuais
- Minimap top-down com cone de FOV, raio de audição e posição do player
- **5 temas visuais**: Escuro, Claro, Ciano, Âmbar, Branco
- **Modo Pausa / Explorar** (`Tab`/`P`): painel sempre acessível
- Click curto = ativar/desativar · Click longo + drag = lançar pêndulo
- Scroll do mouse = ajuste de frequência em semitoms
- Painel de controles completo: tema, espaço acústico, densidade, materiais, volumes
- Painel informativo bilíngue PT/EN sobre Zimoun com links externos
- Arquitetura modular ES6 (7 arquivos)
- Compatível com GitHub Pages (sem build step)

### Roadmap / Próximas versões

- [ ] Gravação do ambiente sonoro (Web Audio OfflineContext)
- [ ] Preset de composições salváveis em JSON
- [ ] Suporte a MIDI externo
- [ ] Visualização espectral em tempo real (AnalyserNode)
- [ ] Modo galeria com câmera automática
