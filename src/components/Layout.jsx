import Header from '@/components/Header.jsx';

const Layout = ({ children, showHeader = true }) => (
  <div className="min-h-screen flex flex-col bg-gray-50">
    {showHeader && <Header />}
    <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {children}
    </main>
  </div>
);

export default (page) => <Layout showHeader={!page.props.isLoginPage}>{page}</Layout>;