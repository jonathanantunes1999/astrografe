#!/usr/bin/env python3
"""Gera o pacote .zip pronto a carregar para o servidor.

Uso:
  python3 ferramentas/empacotar.py producao                  site na raiz do dominio
  python3 ferramentas/empacotar.py demo astrografe           site em dominio/astrografe/

O modo demo acrescenta X-Robots-Tag: noindex (o Google ignora a demonstracao)
e tira os redirecionamentos dos enderecos antigos, que so fazem sentido na raiz.
"""
import re
import sys
import zipfile
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
EXCLUIR = {".git", "ferramentas", ".github", ".gitignore", "README.md"}


def ler_htaccess(modo, pasta):
    texto = (RAIZ / ".htaccess").read_text(encoding="utf-8")
    if modo == "producao":
        return texto
    texto = re.sub(r"# -+ enderecos antigos -+.*?(?=# -+ pagina de erro)", "", texto, flags=re.S)
    texto = texto.replace("ErrorDocument 404 /404.html", f"ErrorDocument 404 /{pasta}/404.html")
    texto = texto.replace(
        "Options -Indexes",
        'Header set X-Robots-Tag "noindex, nofollow"\n\nOptions -Indexes',
    )
    return texto


def pagina_404(modo, pasta):
    # a pagina de erro e servida em qualquer endereco, por isso os caminhos
    # relativos tem de partir da raiz do site
    base = "/" if modo == "producao" else f"/{pasta}/"
    texto = (RAIZ / "404.html").read_text(encoding="utf-8")
    return texto.replace('<meta charset="utf-8">', f'<meta charset="utf-8">\n<base href="{base}">', 1)


def main():
    if len(sys.argv) < 2 or sys.argv[1] not in ("producao", "demo"):
        sys.exit(__doc__)
    modo = sys.argv[1]
    pasta = sys.argv[2] if modo == "demo" and len(sys.argv) > 2 else "astrografe"
    destino = RAIZ.parent / f"astrografe-{modo}.zip"

    with zipfile.ZipFile(destino, "w", zipfile.ZIP_DEFLATED) as z:
        for ficheiro in sorted(RAIZ.rglob("*")):
            relativo = ficheiro.relative_to(RAIZ)
            if ficheiro.is_dir() or relativo.parts[0] in EXCLUIR:
                continue
            if relativo.as_posix() == ".htaccess":
                z.writestr(".htaccess", ler_htaccess(modo, pasta))
            elif relativo.as_posix() == "404.html":
                z.writestr("404.html", pagina_404(modo, pasta))
            else:
                z.write(ficheiro, relativo.as_posix())
    print(destino)


if __name__ == "__main__":
    main()
