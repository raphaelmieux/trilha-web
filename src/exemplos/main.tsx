import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { NoBastidor } from '../components/bastidor';
import { CENAS } from './cenas';
import '../index.css';

/*
  A página de bastidor: monta uma cena — um laboratório aberto com um arquivo
  de exemplo — e mais nada. Quem a abre é o script de captura, com o nome da
  cena depois do #.
*/
const id = decodeURIComponent(location.hash.slice(1));
const Cena = CENAS[id];

createRoot(document.getElementById('root')!).render(
  <NoBastidor.Provider value={true}>
    <MemoryRouter>
      {Cena
        ? <div data-cena={id}><Cena /></div>
        : <p style={{ color: '#FFFFFF', padding: 20 }}>Cena desconhecida: {id || '(nenhuma)'}</p>}
    </MemoryRouter>
  </NoBastidor.Provider>,
);
