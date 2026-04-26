import Link from 'next/link';
import './Breadcrumbs.css';

export default function Breadcrumbs({ paths }) {
  return (
    <nav className="breadcrumbs container">
      {paths.map((path, index) => (
        <span key={index}>
          <Link href={path.url}>{path.name}</Link>
          {index < paths.length - 1 && <span className="separator"> &gt; </span>}
        </span>
      ))}
    </nav>
  );
}
