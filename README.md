# Gerador Musical a partir de Texto

Protótipo desenvolvido em **HTML/CSS/JavaScript no front** e **JavaScript/Node.js no back**, baseado nas fases do trabalho prático.

## O que foi implementado

- Campo de texto principal seguindo o design enviado.
- Leitura de arquivo `.txt` pelo front.
- Salvamento do texto editado como `.txt`.
- Interpretação caractere por caractere.
- Geração de eventos musicais por voz.
- Reprodução sonora no navegador usando Web Audio API.
- Geração e download de arquivo `.mid` pelo backend.
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
npm install
npm start
```

Depois acesse:

```text
http://localhost:3000
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
public/
  index.html       Front em HTML
  styles.css       Estilo inspirado no design enviado
  app.js           Lógica do front e reprodução Web Audio
src/
  server.js        Backend Express
  core/            Regras, parser e interpretador musical
  midi/            Escritor MIDI em JavaScript puro
test/
  musicInterpreter.test.js
```

## Observações técnicas

A reprodução no navegador usa osciladores da Web Audio API, então os timbres são aproximações dos instrumentos General MIDI. O arquivo MIDI salvo contém os programas General MIDI correspondentes e deve tocar com timbres reais em players/DAWs que tenham suporte MIDI.
