import { Route, Routes } from 'react-router-dom';

// SCREENS
import { Home } from 'screens/Home';

export const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  );
};
