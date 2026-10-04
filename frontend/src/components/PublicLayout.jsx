import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import Chatbot from './Chatbot.jsx';

export default function PublicLayout({ children, footer = true }) {
  return (
    <div className="public-layout">
      <Navbar />
      <main className="public-main">{children}</main>
      {footer && <Footer />}
      <Chatbot />
    </div>
  );
}
