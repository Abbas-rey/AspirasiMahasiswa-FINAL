import { ImageResponse } from 'next/og';
import fs from 'fs';
import path from 'path';

export const alt = 'ASMA — Sistem Aspirasi Mahasiswa FST UIN Syarif Hidayatullah Jakarta';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  const logoBuffer = fs.readFileSync(path.join(process.cwd(), 'public/logo.png'));
  const logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '54px 64px',
          background: 'linear-gradient(135deg, #00131E 0%, #00283B 35%, #004A6B 70%, #00638E 100%)',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Subtle decorative glowing orbs */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 460,
            height: 460,
            borderRadius: 9999,
            background: 'rgba(140, 185, 204, 0.22)',
            filter: 'blur(70px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -120,
            left: -80,
            width: 500,
            height: 500,
            borderRadius: 9999,
            background: 'rgba(0, 99, 142, 0.38)',
            filter: 'blur(80px)',
          }}
        />

        {/* Top bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            position: 'relative',
          }}
        >
          {/* Institution badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(191, 216, 227, 0.3)',
              padding: '8px 18px',
              borderRadius: 9999,
            }}
          >
            <div
              style={{
                width: 9,
                height: 9,
                borderRadius: 9999,
                background: '#8CB9CC',
              }}
            />
            <span
              style={{
                color: '#BFD8E3',
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              FST UIN Syarif Hidayatullah Jakarta
            </span>
          </div>

          {/* Verification pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(0, 99, 142, 0.5)',
              border: '1px solid rgba(140, 185, 204, 0.35)',
              padding: '8px 16px',
              borderRadius: 12,
            }}
          >
            <span
              style={{
                color: '#FFFFFF',
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: '0.02em',
              }}
            >
              Portal Resmi Kampus
            </span>
          </div>
        </div>

        {/* Center content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            marginTop: 10,
          }}
        >
          {/* Logo + Title lockup */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 16 }}>
            {/* Official Logo box */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 88,
                height: 88,
                borderRadius: 22,
                background: '#FFFFFF',
                border: '2px solid rgba(191, 216, 227, 0.6)',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.35)',
                padding: 10,
              }}
            >
              <img
                src={logoBase64}
                width={68}
                height={68}
                style={{
                  objectFit: 'contain',
                }}
                alt="Logo ASMA"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
                <span
                  style={{
                    fontSize: 58,
                    fontWeight: 900,
                    color: '#FFFFFF',
                    letterSpacing: '-0.02em',
                    lineHeight: 1,
                  }}
                >
                  ASMA
                </span>
                <span
                  style={{
                    fontSize: 32,
                    fontWeight: 700,
                    color: '#BFD8E3',
                    lineHeight: 1,
                  }}
                >
                  — Sistem Aspirasi Mahasiswa
                </span>
              </div>
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#8CB9CC',
                  marginTop: 6,
                  letterSpacing: '0.04em',
                }}
              >
                Fakultas Sains dan Teknologi (FST)
              </span>
            </div>
          </div>

          {/* Description */}
          <p
            style={{
              fontSize: 21,
              color: '#E0EFF5',
              lineHeight: 1.45,
              maxWidth: 980,
              margin: '12px 0 0 0',
              fontWeight: 400,
            }}
          >
            Wadah penyampaian aspirasi, kritik, dan keluhan mahasiswa secara aman, terstruktur,
            dan transparan langsung kepada pihak Jurusan, Fakultas, maupun Universitas.
          </p>
        </div>

        {/* Bottom features bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            position: 'relative',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              padding: '10px 18px',
              borderRadius: 14,
            }}
          >
            <span style={{ fontSize: 16 }}>🔒</span>
            <span style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 600 }}>
              Mode Anonim & Transparan
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              padding: '10px 18px',
              borderRadius: 14,
            }}
          >
            <span style={{ fontSize: 16 }}>⚡</span>
            <span style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 600 }}>
              Pelacakan Real-time (Kode Tiket)
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              padding: '10px 18px',
              borderRadius: 14,
            }}
          >
            <span style={{ fontSize: 16 }}>🏛️</span>
            <span style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 600 }}>
              Terkoneksi ke Kaprodi & Dekanat
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
