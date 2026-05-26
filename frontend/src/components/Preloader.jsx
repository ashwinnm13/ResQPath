import './Preloader.css';

function Preloader() {
  return (
    <div className="preloader-overlay">
      <div className="preloader-container">
        <div className="ambulance-loader">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="ambulance-icon"
          >
            <circle cx="9" cy="19" r="2"></circle>
            <circle cx="20" cy="19" r="2"></circle>
            <path d="M3 8h15v10H3z"></path>
            <path d="M3 8V6h12"></path>
            <path d="M16 9v4"></path>
            <path d="M19 12h4"></path>
          </svg>
          <div className="loader-text">ResQPath</div>
        </div>
        <div className="loader-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
}

export default Preloader;
