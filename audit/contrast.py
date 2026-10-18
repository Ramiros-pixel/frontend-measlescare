#!/usr/bin/env python3
"""Pemindai kontras WCAG untuk pasangan token tema MeaslesCare (R-25).

Pemakaian: python3 audit/contrast.py
Mencetak rasio dan verdict setiap pasangan teks/latar yang dipakai UI.
"""
import importlib.util
import os

HERE = os.path.dirname(os.path.abspath(__file__))
_CHECKER = os.path.join(HERE, '..', 'anti-slop', 'skills', 'antislop-human', 'contrast-check.py')
_spec = importlib.util.spec_from_file_location('contrast_check', _CHECKER)
_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_mod)


def check_contrast(fg: str, bg: str) -> dict:
    # Formula WCAG dari contrast-check.py antislop; threshold dibaca dari
    # rasio mentah agar kasus 4.498:1 tidak lolos karena pembulatan (v3.2.21).
    ratio = _mod.contrast_ratio(_mod.parse_hex(fg), _mod.parse_hex(bg))
    return {
        'ratio': ratio,
        'normal_text': {'pass': ratio >= 4.5},
        'large_text': {'pass': ratio >= 3.0},
    }

# (teks, latar, konteks)
PAIRS = [
    ('#0F172A', '#FFFFFF', 'teks utama di kartu (surface)'),
    ('#0F172A', '#F8FAFC', 'teks utama di latar halaman'),
    ('#46586E', '#FFFFFF', 'teks sekutu/muted di kartu'),
    ('#46586E', '#F8FAFC', 'teks sekutu/muted di latar halaman'),
    ('#FFFFFF', '#175CD3', 'teks tombol primary'),
    ('#175CD3', '#FFFFFF', 'teks tautan/ikon primary di kartu'),
    ('#175CD3', '#EAF1FD', 'teks primary di latar soft (nav aktif)'),
    ('#B42318', '#FDECEA', 'teks error di latar danger-soft'),
    ('#067647', '#E6F4EA', 'teks sukses di latar success-soft'),
    ('#B54708', '#FDF1E5', 'teks peringatan di latar warning-soft'),
    ('#175CD3', '#EAF1FD', 'teks info di latar info-soft'),
]


def main() -> int:
    failures = 0
    for fg, bg, note in PAIRS:
        result = check_contrast(fg, bg)
        normal = 'PASS' if result['normal_text']['pass'] else 'FAIL'
        large = 'PASS' if result['large_text']['pass'] else 'FAIL'
        if normal == 'FAIL':
            failures += 1
        print(
            f"{fg} on {bg} ({note}): {result['ratio']:.2f}:1 | "
            f"teks normal {normal} | teks besar {large}"
        )
    if failures:
        print(f"\n{failures} pasangan gagal 4.5:1 untuk teks normal")
        return 1
    print("\nSemua pasangan lolos 4.5:1 untuk teks normal")
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
