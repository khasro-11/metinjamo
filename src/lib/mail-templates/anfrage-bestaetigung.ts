/**
 * HTML body of the confirmation mail — the copy the enquirer receives.
 *
 * Off by default. `BREVO_SEND_CONFIRMATION` gates it, and it ships unset
 * because the client decided against an auto-reply. The markup is kept ready
 * rather than deleted so that turning it on is one environment variable and not
 * a rebuild of a mail template.
 *
 * Because this mail leaves the company, it is a Geschäftsbrief: § 35a GmbHG
 * requires it to carry the firm, its seat, the register court, the register
 * number and every managing director. Those arrive as parameters from
 * `company.ts` — see `renderQuoteMail` — so that they are written down in
 * exactly one place (Claude.md 2).
 *
 * Placeholders are `{{snake_case}}`, filled by `renderMailTemplate` from
 * `ConfirmationParams`, HTML-escaped on the way in. See the sibling
 * `anfrage-intern.ts` for why the markup lives in the repo and not in the
 * provider's dashboard.
 */

export const CONFIRMATION_HTML = `<!DOCTYPE html>
<html lang="de" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>{{subject}}</title>
<!--[if mso]>
<noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
<![endif]-->
<style>
  body { margin: 0; padding: 0; width: 100% !important; }
  img { border: 0; line-height: 100%; outline: none; text-decoration: none; }
  table { border-collapse: collapse !important; }

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
    .pad { padding-left: 22px !important; padding-right: 22px !important; }
    .stack { display: block !important; width: 100% !important; }
    .stack-gap { padding-top: 14px !important; }
    .h1 { font-size: 25px !important; line-height: 33px !important; }
  }
</style>
</head>

<body style="margin:0; padding:0; background-color:#eaf4fa;">

<!-- Preheader: der erste Satz, den der Kunde in der Inbox sieht. Er sagt,
     dass die Anfrage angekommen ist — mehr braucht die Vorschau nicht. -->
<div style="display:none; font-size:1px; color:#eaf4fa; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden;">
  Ihre Anfrage ist bei uns eingegangen. Wir melden uns zu den Geschäftszeiten. &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#eaf4fa;">
<tr>
<td align="center" style="padding:24px 12px;">

  <table role="presentation" class="sp" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px; max-width:600px;">

    <!-- ============================================================
         Kopf — Farbanker blue-900. Die Wortmarke ist Typografie, kein
         Bild: Mail-Clients blockieren Bilder standardmäßig, und die
         Domain ist noch nicht live. Ein Logo, das als leerer Rahmen
         ankommt, ist schlechter als gesetzter Text.
         ============================================================ -->
    <tr>
      <td class="pad" style="background-color:#14547e; border-radius:20px 20px 0 0; padding:32px 34px 30px 34px;">
        <p style="margin:0 0 20px 0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; font-size:15px; line-height:22px; font-weight:600; letter-spacing:1.2px; color:#ffffff;">
          {{company_name}}
        </p>
        <p style="margin:0 0 10px 0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; font-size:10px; line-height:14px; letter-spacing:2px; text-transform:uppercase; color:#eaf4fa;">
          Eingangsbestätigung
        </p>
        <h1 class="h1" style="margin:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; font-size:28px; line-height:36px; font-weight:600; letter-spacing:-0.5px; color:#ffffff; mso-line-height-rule:exactly;">
          Ihre Anfrage ist angekommen
        </h1>
      </td>
    </tr>

    <!-- ============================================================
         Anrede und Zusage. Keine Antwortzeit in Stunden — "zu den
         Geschäftszeiten" ist eine Zusage, die gehalten werden kann.
         ============================================================ -->
    <tr>
      <td class="pad" style="background-color:#fbfcfd; padding:32px 34px 0 34px;">
        <p style="margin:0 0 18px 0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; font-size:17px; line-height:28px; color:#0f1b24;">
          Guten Tag {{customer_name}},
        </p>
        <p style="margin:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; font-size:16px; line-height:28px; color:#4a4d50;">
          vielen Dank für Ihre Anfrage. Sie ist am {{submitted_at}} bei uns
          eingegangen. Wir sehen sie uns an und melden uns zu den
          Geschäftszeiten bei Ihnen.
        </p>
      </td>
    </tr>

    <!-- ============================================================
         Zusammenfassung. Double-Bezel: sand-100 als Hülle, weisser
         Kern, Radien konzentrisch. Der warme Ton trennt den Block vom
         Fließtext, ohne eine zweite Blaufläche einzuführen.
         ============================================================ -->
    <tr>
      <td class="pad" style="background-color:#fbfcfd; padding:28px 34px 32px 34px;">

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f3ede4; border-radius:26px;">
        <tr>
          <td style="padding:9px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff; border-radius:17px;">
            <tr>
              <td style="padding:24px 24px 26px 24px;">

                <p style="margin:0 0 20px 0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; font-size:10px; line-height:14px; letter-spacing:1.8px; text-transform:uppercase; color:#1c6b9c;">
                  Das haben Sie uns übermittelt
                </p>

                <p style="margin:0 0 6px 0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; font-size:11px; line-height:16px; color:#4a4d50;">
                  Leistungen
                </p>
                <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; color:#0f1b24;">
                  <pre class="block-pre">{{services_block}}</pre>
                </div>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;">
                <tr><td height="1" style="height:1px; background-color:#f3ede4; font-size:0; line-height:0;">&nbsp;</td></tr>
                </table>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:18px;">
                <tr>
                  <td class="stack" width="50%" valign="top" style="padding:0 10px 0 0;">
                    <p style="margin:0 0 2px 0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; font-size:11px; line-height:16px; color:#4a4d50;">Turnus</p>
                    <p style="margin:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; font-size:15px; line-height:24px; font-weight:500; color:#0f1b24;">{{frequency}}</p>
                  </td>
                  <td class="stack stack-gap" width="50%" valign="top" style="padding:0 0 0 10px;">
                    <p style="margin:0 0 2px 0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; font-size:11px; line-height:16px; color:#4a4d50;">Objektart</p>
                    <p style="margin:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; font-size:15px; line-height:24px; font-weight:500; color:#0f1b24;">{{property_type}}</p>
                  </td>
                </tr>
                <tr>
                  <td class="stack stack-gap" colspan="2" valign="top" style="padding-top:16px;">
                    <p style="margin:0 0 2px 0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; font-size:11px; line-height:16px; color:#4a4d50;">Postleitzahl</p>
                    <p style="margin:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; font-size:15px; line-height:24px; font-weight:500; color:#0f1b24;">{{postal_code}}</p>
                  </td>
                </tr>
                </table>

              </td>
            </tr>
            </table>
          </td>
        </tr>
        </table>

        <p style="margin:18px 0 0 0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; font-size:14px; line-height:24px; color:#4a4d50;">
          Stimmt etwas davon nicht, antworten Sie einfach auf diese E-Mail.
        </p>

      </td>
    </tr>

    <!-- ============================================================
         Kontakt — zweiter Farbanker blue-900. Die Telefonnummer ist
         der schnellere Weg als eine Mail, deshalb steht sie als
         eigene Fläche und nicht als Zeile im Fließtext.
         Kein Pfeil-Icon: dafür gibt es in E-Mail kein SVG, und ein
         Textpfeil wäre Deko. Die Fläche selbst ist die Handlung.
         ============================================================ -->
    <tr>
      <td class="pad" style="background-color:#14547e; padding:30px 34px 32px 34px;">
        <p style="margin:0 0 6px 0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; font-size:10px; line-height:14px; letter-spacing:1.8px; text-transform:uppercase; color:#eaf4fa;">
          Lieber direkt sprechen
        </p>
        <a href="tel:{{company_phone}}" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; font-size:26px; line-height:38px; font-weight:600; letter-spacing:-0.3px; color:#ffffff; text-decoration:none;">{{company_phone}}</a>
        <p style="margin:6px 0 0 0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; font-size:14px; line-height:24px; color:#eaf4fa;">
          {{office_hours}}
        </p>
      </td>
    </tr>

    <!-- ============================================================
         Datenschutz. Kurz, konkret, mit Link — kein Textblock, den
         niemand liest, aber auch keine Auslassung.
         ============================================================ -->
    <tr>
      <td class="pad" style="background-color:#fbfcfd; padding:28px 34px 28px 34px;">
        <p style="margin:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; font-size:13px; line-height:22px; color:#4a4d50;">
          Ihre Angaben verwenden wir ausschließlich, um Ihre Anfrage zu
          bearbeiten und Ihnen ein Angebot zu machen. Wir geben sie nicht zu
          Werbezwecken weiter. Einzelheiten zu Zweck, Rechtsgrundlage,
          Speicherdauer und zu Ihren Rechten auf Auskunft, Berichtigung,
          Löschung und Widerspruch finden Sie in unserer
          <a href="{{privacy_url}}" style="color:#1c6b9c; text-decoration:underline;">Datenschutzerklärung</a>.
        </p>
      </td>
    </tr>

    <!-- ============================================================
         Fuß auf ink. Pflichtangaben nach § 35a GmbHG: Firma, Sitz,
         Registergericht, HR-Nummer, Geschäftsführer. Alle als
         Platzhalter aus company.ts.
         ============================================================ -->
    <tr>
      <td class="pad" style="background-color:#0f1b24; border-radius:0 0 20px 20px; padding:28px 34px 30px 34px;">
        <p style="margin:0 0 4px 0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; font-size:14px; line-height:22px; font-weight:600; color:#ffffff;">
          {{company_name}}
        </p>
        <p style="margin:0 0 14px 0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; font-size:13px; line-height:22px; color:#b9c2c9;">
          {{company_address}}<br>
          <a href="tel:{{company_phone}}" style="color:#b9c2c9; text-decoration:none;">{{company_phone}}</a> &middot;
          <a href="mailto:{{company_email}}" style="color:#b9c2c9; text-decoration:none;">{{company_email}}</a>
        </p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td height="1" style="height:1px; background-color:#2a3a46; font-size:0; line-height:0;">&nbsp;</td></tr>
        </table>
        <p style="margin:14px 0 0 0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; font-size:12px; line-height:20px; color:#8a8f94;">
          {{company_registry}}<br>
          Geschäftsführer: {{company_director}}
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
