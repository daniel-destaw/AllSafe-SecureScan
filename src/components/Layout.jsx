// src/layouts/Layout.jsx
import Header from '@/components/Header.jsx';

const Layout = ({ children }) => (
  <>
    <Header />
    <main> {/* Remove centering and add some padding */}
      {children}
    </main>
  </>
);

export default (page) => <Layout>{page}</Layout>;
