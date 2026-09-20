import '../globals.css';
import '../shop.css';
import Script from 'next/script';
import { contentLocales, ui } from '../../lib/content/index.js';
import { localeDir, getLocale } from '../../lib/i18n.js';
import { CONSENT_DEFAULT, GTM_ID, CLARITY_ID } from '../../lib/analytics.js';
import ConsentBanner from '../../components/ConsentBanner.jsx';
import { SITE_URL } from '../../lib/routes.js';

export const dynamicParams = false;

export function generateStaticParams() {
  return contentLocales().map((lang) => ({ lang }));
}

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Livdar eSIM', template: '%s' },
  applicationName: 'Livdar',
  formatDetection: { telephone: false },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fbfaf8' },
    { media: '(prefers-color-scheme: dark)', color: '#0f1113' },
  ],
};

export default async function LangLayout({ children, params }) {
  const { lang } = await params;
  const locale = getLocale(lang) ? lang : 'en';
  const t = ui(locale);

  // Consent defaults are written synchronously, before anything else can run.
  const consentBoot = [
    'window.dataLayer=window.dataLayer||[];',
    'function gtag(){dataLayer.push(arguments);}',
    'gtag("consent","default",' + JSON.stringify(CONSENT_DEFAULT) + ');',
    'gtag("set","ads_data_redaction",true);',
    'gtag("set","url_passthrough",true);',
  ].join('');

  return (
    <html lang={locale} dir={localeDir(locale)}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&display=swap"
        />
        <script dangerouslySetInnerHTML={{ __html: consentBoot }} />
      </head>
      <body>
        <a className="skip" href="#main">{t.skipToContent}</a>
        {children}
        <ConsentBanner strings={t} />
        {GTM_ID ? (
          <Script id="livdar-gtm" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}
          </Script>
        ) : null}
        {CLARITY_ID ? (
          <Script id="livdar-clarity" strategy="afterInteractive">
            {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${CLARITY_ID}");`}
          </Script>
        ) : null}
      </body>
    </html>
  );
}
