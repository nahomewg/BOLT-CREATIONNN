export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Claude Chat Interface</title>
        <meta name="description" content="Custom Claude Chat Interface" />
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
