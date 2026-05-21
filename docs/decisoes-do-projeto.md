# Decisões do projeto

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
- `public/app.js`: interface e reprodução no navegador.

Essa separação reduz classe grande, método longo, duplicação, lista longa de parâmetros e switch/if-else concentrado.
