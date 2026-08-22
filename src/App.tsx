import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from '@/pages/LandingPage';
import ResultPage from '@/pages/ResultPage';
import GalleryPage from '@/pages/GalleryPage';
import HowItWorksPage from '@/pages/HowItWorksPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/reel/:id" element={<ResultPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
