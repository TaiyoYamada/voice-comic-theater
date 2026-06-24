import { useNavigate } from 'react-router-dom'
import { Ruby } from '../components/Furigana'
import { Icon } from '../components/icons'
import { Mascot } from '../components/Mascot'

/** 起動時のホーム（タイトル）画面。教育系キッズアプリ風。 */
export function Home({ onStart }: { onStart: () => void }) {
  const navigate = useNavigate()
  return (
    <div className="home">
      {/* 背景のカラフルな丸（ブランド10色のうち数色） */}
      <div className="home-blobs" aria-hidden>
        <span className="blob b1" />
        <span className="blob b2" />
        <span className="blob b3" />
        <span className="blob b4" />
      </div>

      <div className="home-inner">
        <Mascot />
        <h1 className="home-title">コエコミ</h1>
        <p className="home-tagline">
          <Ruby text="じぶんの声(こえ)で 4コマげきじょうを つくろう！" />
        </p>

        <button className="btn big home-start" onClick={onStart}>
          <Ruby text="つくってみよう！" />
        </button>
      </div>

      <button className="home-adults" onClick={() => navigate('/privacy')}>
        <Icon name="lock" size={16} />
        <Ruby text="おうちの人(ひと)・先生(せんせい)へ" />
      </button>
    </div>
  )
}
