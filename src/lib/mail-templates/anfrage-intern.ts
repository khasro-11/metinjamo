/**
 * HTML body of the internal notification — the mail that carries the lead to
 * info@imperial-gmbh.com.
 *
 * GENERATED-BY-HAND-ONCE, then maintained here. This file used to live in
 * `docs/email-templates/anfrage-intern.html` and be pasted into a provider
 * dashboard. It does not any more: Brevo is called with `htmlContent`, so the
 * markup travels with the request and this file is the only copy that exists.
 * Edit it here, and the next send uses it — no dashboard step, nothing to
 * forget, and the template is reviewable in a diff like the rest of the code.
 *
 * Placeholders are `{{snake_case}}` and are filled by `renderMailTemplate`
 * from `NotificationParams` (`src/lib/quote-mail.ts`). Every value is
 * HTML-escaped on the way in — the name and the message are text a stranger
 * typed, and this is the boundary where that stops mattering. Renaming a
 * parameter without renaming it here throws at send time rather than silently
 * shipping a mail with a blank row.
 *
 * Why table layout and inline styles: Outlook renders with the Word engine and
 * knows neither flexbox, grid nor external CSS. The `<style>` block in the head
 * is progressive enhancement for mobile clients only.
 */

export const INTERNAL_NOTIFICATION_HTML = `<!DOCTYPE html>
<html lang="de" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<!-- Helle Darstellung festschreiben. Ohne das invertieren iOS Mail und
     Outlook.com die Farben eigenmächtig und das Markenblau kippt ins Grelle.
     CLAUDE.md 4: kein Dark Mode in v1. -->
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>{{subject}}</title>
<!--[if mso]>
<noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
<![endif]-->
<style>
  /* Kein Webfont: Gmail entfernt @font-face, Outlook ignoriert es. Die
     Systemschrift ist hier die einzige Schrift, die ueberall ankommt. */
  body { margin: 0; padding: 0; width: 100% !important; }
  img { border: 0; line-height: 100%; outline: none; text-decoration: none; }
  table { border-collapse: collapse !important; }
  a { color: #1c6b9c; }

  /* Der Leistungsblock kommt mit Zeilenumbrüchen und Einrückung aus
     formatServices(). <pre> behält beides, pre-wrap lässt ihn auf dem
     Telefon trotzdem umbrechen statt horizontal zu scrollen. */
  .block-pre {
    margin: 0;
    font-family: inherit;
    font-size: 15px;
    line-height: 26px;
    white-space: pre-wrap;
    word-break: break-word;
  }

  @media only screen and (max-width: 620px) {
    .sp { width: 100% !important; }
    .pad { padding-left: 20px !important; padding-right: 20px !important; }
    .stack { display: block !important; width: 100% !important; }
    .stack-gap { padding-top: 12px !important; }
    .h1 { font-size: 24px !important; line-height: 32px !important; }
  }
</style>
</head>

<body style="margin:0; padding:0; background-color:#eaf4fa;">

<!-- Preheader. Steht in der Inbox-Vorschau direkt hinter dem Betreff und
     trägt genau das, was der Betreff nicht mehr fasst: wer und welche
     Nummer. Damit ist ein Rückruf ohne Öffnen möglich. -->
<div style="display:none; font-size:1px; color:#eaf4fa; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden;">
  {{customer_name}}, {{customer_phone}} &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#eaf4fa;">
<tr>
<td align="center" style="padding:24px 12px;">

  <table role="presentation" class="sp" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px; max-width:600px;">

    <!-- ============================================================
         Kopf. Farbanker blue-900, weisser Text auf 8,08:1.
         ============================================================ -->
    <tr>
      <td class="pad" style="background-color:#14547e; border-radius:20px 20px 0 0; padding:28px 32px 26px 32px;">
        <p style="margin:0 0 10px 0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; font-size:10px; line-height:14px; letter-spacing:2px; text-transform:uppercase; color:#eaf4fa;">
          Angebotsanfrage
        </p>
        <h1 class="h1" style="margin:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; font-size:27px; line-height:34px; font-weight:600; letter-spacing:-0.4px; color:#ffffff; mso-line-height-rule:exactly;">
          {{customer_name}}
        </h1>
        <p style="margin:8px 0 0 0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; font-size:14px; line-height:22px; color:#eaf4fa;">
          {{postal_code}} {{location}} &middot; eingegangen am {{submitted_at}}
        </p>
      </td>
    </tr>

    <!-- ============================================================
         Kontakt. Die wichtigste Fläche der Mail, deshalb direkt unter
         dem Kopf und nicht unten. Double-Bezel: außen sand-100 als
         Hülle, innen weiss als Kern, Radien konzentrisch (16 = 24-8).
         Jede Zeile ist über 44px hoch und damit ein sauberes
         Touch-Target (CLAUDE.md 9).
         ============================================================ -->
    <tr>
      <td class="pad" style="background-color:#fbfcfd; padding:28px 32px 4px 32px;">

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f3ede4; border-radius:24px;">
        <tr>
          <td style="padding:8px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff; border-radius:16px;">

              <!-- Telefon -->
              <tr>
                <td style="padding:16px 20px 14px 20px;">
                  <p style="margin:0 0 3px 0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; font-size:10px; line-height:14px; letter-spacing:1.6px; text-transform:uppercase; color:#1c6b9c;">
                    Telefon
                  </p>
                  <a href="tel:{{customer_phone}}" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; font-size:21px; line-height:30px; font-weight:600; color:#14547e; text-decoration:none;">{{customer_phone}}</a>
                </td>
              </tr>

              <!-- Trenner als gefüllte Zelle, nicht als border. Word
                   zeichnet 1px-borders unzuverlaessig, eine 1px hohe
                   Zelle immer. -->
              <tr><td style="padding:0 20px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td height="1" style="height:1px; background-color:#eaf4fa; font-size:0; line-height:0;">&nbsp;</td></tr></table></td></tr>

              <!-- E-Mail -->
              <tr>
                <td style="padding:14px 20px 16px 20px;">
                  <p style="margin:0 0 3px 0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; font-size:10px; line-height:14px; letter-spacing:1.6px; text-transform:uppercase; color:#1c6b9c;">
                    E-Mail
                  </p>
                  <a href="mailto:{{customer_email}}" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; font-size:16px; line-height:26px; font-weight:500; color:#14547e; text-decoration:none; word-break:break-all;">{{customer_email}}</a>
                </td>
              </tr>

              <tr><td style="padding:0 20px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td height="1" style="height:1px; background-color:#eaf4fa; font-size:0; line-height:0;">&nbsp;</td></tr></table></td></tr>

              <!-- Firma. Leer gelassene Felder kommen als Gedankenstrich
                   an, nicht als Leerstelle: eine Zeile "Firma —" ist eine
                   Aussage, eine leere Zeile sieht wie ein Fehler aus. -->
              <tr>
                <td style="padding:14px 20px 16px 20px;">
                  <p style="margin:0 0 3px 0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; font-size:10px; line-height:14px; letter-spacing:1.6px; text-transform:uppercase; color:#4a4d50;">
                    Firma
                  </p>
                  <p style="margin:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; font-size:16px; line-height:26px; color:#0f1b24;">{{customer_company}}</p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
        </table>

      </td>
    </tr>

    <!-- ============================================================
         Leistungen. Der Block ist vorformatiert und nach Kategorien
         verschachtelt — er darf nicht in HTML-Fließtext gequetscht
         werden, sonst steht alles in einer Zeile.
         ============================================================ -->
    <tr>
      <td class="pad" style="background-color:#fbfcfd; padding:28px 32px 0 32px;">
        <p style="margin:0 0 12px 0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; font-size:10px; line-height:14px; letter-spacing:1.8px; text-transform:uppercase; color:#1c6b9c;">
          Leistungen
        </p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#eaf4fa; border-radius:20px;">
        <tr>
          <td style="padding:18px 22px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; color:#0f1b24;">
            <pre class="block-pre">{{services_block}}</pre>
          </td>
        </tr>
        </table>
      </td>
    </tr>

    <!-- ============================================================
         Objekt. Zwei Spalten auf dem Desktop, gestapelt unter 620px.
         Kein <ul>, kein Hairline unter jeder Zeile — Label über Wert,
         das liest sich auf dem Telefon in einem Blick.
         ============================================================ -->
    <tr>
      <td class="pad" style="background-color:#fbfcfd; padding:28px 32px 0 32px;">
        <p style="margin:0 0 14px 0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; font-size:10px; line-height:14px; letter-spacing:1.8px; text-transform:uppercase; color:#1c6b9c;">
          Objekt und Turnus
        </p>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td class="stack" width="50%" valign="top" style="padding:0 10px 16px 0;">
            <p style="margin:0 0 2px 0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; font-size:11px; line-height:16px; color:#4a4d50;">Objektart</p>
            <p style="margin:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; font-size:16px; line-height:24px; font-weight:500; color:#0f1b24;">{{property_type}}</p>
          </td>
          <td class="stack" width="50%" valign="top" style="padding:0 0 16px 10px;">
            <p style="margin:0 0 2px 0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; font-size:11px; line-height:16px; color:#4a4d50;">Turnus</p>
            <p style="margin:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; font-size:16px; line-height:24px; font-weight:500; color:#0f1b24;">{{frequency}}</p>
          </td>
        </tr>
        <tr>
          <td class="stack" width="50%" valign="top" style="padding:0 10px 0 0;">
            <p style="margin:0 0 2px 0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; font-size:11px; line-height:16px; color:#4a4d50;">PLZ und Ort</p>
            <p style="margin:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; font-size:16px; line-height:24px; font-weight:500; color:#0f1b24;">{{postal_code}} {{location}}</p>
          </td>
          <td class="stack stack-gap" width="50%" valign="top" style="padding:0 0 0 10px;">
            <p style="margin:0 0 2px 0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; font-size:11px; line-height:16px; color:#4a4d50;">Größe und Umfang</p>
            <p style="margin:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; font-size:16px; line-height:24px; font-weight:500; color:#0f1b24;">{{size}}</p>
          </td>
        </tr>
        </table>
      </td>
    </tr>

    <!-- ============================================================
         Nachricht. Freitext des Absenders, deshalb als eigener Block
         mit Rahmen: man sieht sofort, wo seine Worte anfangen und wo
         unsere Struktur aufhört.
         ============================================================ -->
    <tr>
      <td class="pad" style="background-color:#fbfcfd; padding:28px 32px 0 32px;">
        <p style="margin:0 0 12px 0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; font-size:10px; line-height:14px; letter-spacing:1.8px; text-transform:uppercase; color:#1c6b9c;">
          Nachricht
        </p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f3ede4; border-radius:20px;">
        <tr>
          <td style="padding:8px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff; border-radius:12px;">
            <tr>
              <td style="padding:18px 20px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; font-size:15px; line-height:26px; color:#0f1b24;">
                <pre class="block-pre">{{customer_message}}</pre>
              </td>
            </tr>
            </table>
          </td>
        </tr>
        </table>
      </td>
    </tr>

    <!-- ============================================================
         Fuß. Der Hinweis auf Reply-To ist kein Deko-Satz: er sagt der
         Person am Postfach, dass sie einfach antworten kann.
         ============================================================ -->
    <tr>
      <td class="pad" style="background-color:#fbfcfd; border-radius:0 0 20px 20px; padding:28px 32px 30px 32px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td height="1" style="height:1px; background-color:#eaf4fa; font-size:0; line-height:0;">&nbsp;</td></tr>
        </table>
        <p style="margin:18px 0 0 0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; font-size:13px; line-height:21px; color:#4a4d50;">
          Eine Antwort auf diese E-Mail geht direkt an
          <a href="mailto:{{reply_to}}" style="color:#1c6b9c; text-decoration:underline;">{{reply_to}}</a>.
          Gesendet vom Anfrageformular der Website.
        </p>
      </td>
    </tr>

  </table>

</td>
</tr>
</table>

</body>
</html>
`;
