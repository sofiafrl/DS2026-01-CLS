# Gerador Musical a partir de Texto

Protótipo desenvolvido inteiramente em **HTML/CSS/TypeScript no front-end**, rodando diretamente no navegador.

## Interface oficial

A interface oficial do protótipo é o arquivo `index.html` localizado na raiz do projeto. Ele é servido localmente utilizando o script de desenvolvimento incluso na raiz do projeto.

Os arquivos Svelte que ainda existirem no repositório não fazem parte do fluxo principal executado por `npm start`. Eles devem ser tratados como protótipo paralelo/legado até uma decisão futura de remoção ou migração completa.

## O que foi implementado

- Campo de texto principal seguindo o design enviado.
- Leitura de arquivo `.txt` pelo front.
- Salvamento do texto editado como `.txt`.
- Interpretação caractere por caractere.
- Geração de eventos musicais por voz.
- Reprodução sonora no navegador usando Web Audio API.
- Geração e download de arquivo `.mid` diretamente no frontend.
- Configuração de BPM, volume, oitava e instrumento inicial.
- Suporte à fuga simples da Fase 2:
  - cada linha vira uma voz;
  - `[n]` no início da linha cria atraso em beats;
  - oitavas, volumes e instrumentos base por voz;
  - `>` aumenta BPM e `<` diminui BPM;
  - `?` sobe oitava e `V` desce oitava;
  - `Mb` gera Mi bemol.

## Como rodar

```bash
npm start
```

Depois acesse:

```text
http://localhost:5173
```

## Como testar

```bash
npm test
```

## Exemplo de entrada

```text
[0] C D E F ,
[4] G A B C ,
[8] G A H C > D E F G
```

## Estrutura

```text
index.html       Front em HTML (interface gráfica)
tsconfig.json    Configuração do TypeScript
src/
  styles.css       Estilo da interface
  app.ts           Coordenação da interface
  MusicService.ts  Integração local no frontend (chama o interpretador)
  AudioPlayer.ts   Reprodução Web Audio (controle de transporte)
  fileService.ts   Leitura e download de arquivos
  pieceRenderer.ts Renderização dos eventos musicais
  core/            Regras, parser, interpretador e sintetizador (TypeScript)
  midi/            Escritor MIDI em TypeScript
test/
  musicInterpreter.test.ts
```

## Observações técnicas

A reprodução no navegador usa osciladores da Web Audio API, então os timbres são aproximações dos instrumentos General MIDI. O arquivo MIDI salvo contém os programas General MIDI correspondentes e deve tocar com timbres reais em players/DAWs que tenham suporte MIDI.
