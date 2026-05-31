# Decisões do projeto

## Interface oficial

A interface oficial do protótipo é a interface estática em `public/`, servida pelo Express em `src/server.js`.

Essa decisão foi mantida porque a interface em `public/` já concentra o fluxo funcional da Fase 2: entrada por texto, leitura de TXT, salvamento de TXT, configurações musicais, reprodução sonora, listagem de eventos e download MIDI.

Os arquivos Svelte presentes no repositório não são usados pelo comando `npm start` e não fazem parte da interface final atual. Eles permanecem apenas como protótipo paralelo/legado enquanto o grupo não decidir removê-los ou migrar completamente a interface.

## Fase 1

O sistema lê texto em uma interface, interpreta cada caractere, gera eventos musicais reproduzíveis e permite configurar BPM, volume, instrumento e oitava.

## Fase 2

O sistema foi adaptado para aceitar múltiplas vozes: cada linha do texto corresponde a uma voz independente. O atraso inicial `[n]` cria entradas sucessivas, aproximando a ideia de fuga. Também foram implementados comandos locais de oitava e volume, comandos de andamento e download de MIDI.

## Fase 3

Como a Fase 3 enfatiza bad smells, o código foi organizado para evitar uma única classe `GeradorMusical` fazendo tudo. As responsabilidades principais foram separadas:

- `TextParser`: leitura estrutural das linhas e atrasos.
- `VoiceContext`: estado de execução de uma voz.
- `Rules`: regras de mapeamento de caracteres.
- `MusicInterpreter`: orquestração da interpretação.
- `MidiWriter`: geração binária do arquivo MIDI.
- `server.js`: API HTTP.
- `public/app.js`: coordenação da interface estática.
- `public/apiClient.js`: chamadas para a API HTTP.
- `public/audioPlayer.js`: reprodução no navegador com Web Audio API.
- `public/fileService.js`: leitura de TXT e downloads.
- `public/pieceRenderer.js`: renderização do resumo e dos eventos musicais.

Essa separação reduz classe grande, método longo, duplicação, lista longa de parâmetros e switch/if-else concentrado.
