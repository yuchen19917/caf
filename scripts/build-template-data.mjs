import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

/** Individual prepaid CAF — table layout, CRM placeholders {{...}} */
const INDIVIDUAL_CAF_BLUEPRINT = `
<div style="font-family:system-ui,-apple-system,sans-serif;font-size:13px;color:#0f172a;line-height:1.45;">
  <p style="text-align:center;margin:0 0 4px;font-size:15px;font-weight:800;">فورم درخواست مشتری / Customer Application Form</p>
  <p style="text-align:center;margin:0 0 18px;font-size:11px;color:#64748b;">SIM Registration · Prepaid Standard · Placeholders bind at submission</p>

  <div style="background:#e5e7eb;border:1px solid #94a3b8;padding:6px 10px;font-weight:700;font-size:12px;margin-top:4px;">1. نام مشتری · Customer name</div>
  <table style="width:100%;border-collapse:collapse;border:1px solid #cbd5e1;font-size:12px;margin-bottom:12px;">
    <tr>
      <td style="border:1px solid #cbd5e1;padding:8px;width:32%;background:#f8fafc;font-weight:600;">نام قانونی / Legal name</td>
      <td style="border:1px solid #cbd5e1;padding:8px;">{{fullName}}</td>
    </tr>
  </table>

  <div style="background:#e5e7eb;border:1px solid #94a3b8;padding:6px 10px;font-weight:700;font-size:12px;">2. معلومات شناسنامه · Identity document</div>
  <table style="width:100%;border-collapse:collapse;border:1px solid #cbd5e1;font-size:12px;margin-bottom:12px;">
    <tr>
      <td style="border:1px solid #cbd5e1;padding:8px;width:32%;background:#f8fafc;font-weight:600;">نوع شناسنامه / ID type</td>
      <td style="border:1px solid #cbd5e1;padding:8px;">{{idType}}</td>
    </tr>
    <tr>
      <td style="border:1px solid #cbd5e1;padding:8px;background:#f8fafc;font-weight:600;">شماره شناسنامه / ID number</td>
      <td style="border:1px solid #cbd5e1;padding:8px;">{{idNumber}}</td>
    </tr>
  </table>

  <div style="background:#e5e7eb;border:1px solid #94a3b8;padding:6px 10px;font-weight:700;font-size:12px;">3. آدرس مسکونی · Residential address</div>
  <table style="width:100%;border-collapse:collapse;border:1px solid #cbd5e1;font-size:12px;margin-bottom:12px;">
    <tr>
      <td style="border:1px solid #cbd5e1;padding:8px;width:32%;background:#f8fafc;font-weight:600;vertical-align:top;">آدرس کامل / Full address</td>
      <td style="border:1px solid #cbd5e1;padding:8px;vertical-align:top;">{{address}}</td>
    </tr>
  </table>

  <div style="background:#e5e7eb;border:1px solid #94a3b8;padding:6px 10px;font-weight:700;font-size:12px;">4. معلومات تماس · Contact</div>
  <table style="width:100%;border-collapse:collapse;border:1px solid #cbd5e1;font-size:12px;margin-bottom:12px;">
    <tr>
      <td style="border:1px solid #cbd5e1;padding:8px;width:32%;background:#f8fafc;font-weight:600;">شماره موبایل / Mobile</td>
      <td style="border:1px solid #cbd5e1;padding:8px;">{{contactNumber}}</td>
    </tr>
    <tr>
      <td style="border:1px solid #cbd5e1;padding:8px;background:#f8fafc;font-weight:600;">ایمیل / E-mail</td>
      <td style="border:1px solid #cbd5e1;padding:8px;">{{email}}</td>
    </tr>
  </table>

  <div style="background:#e5e7eb;border:1px solid #94a3b8;padding:6px 10px;font-weight:700;font-size:12px;">5. آدرس صورتحساب · Billing address</div>
  <table style="width:100%;border-collapse:collapse;border:1px solid #cbd5e1;font-size:12px;margin-bottom:12px;">
    <tr>
      <td style="border:1px solid #cbd5e1;padding:8px;width:32%;background:#f8fafc;font-weight:600;vertical-align:top;">آدرس صورتحساب (می‌تواند با آدرس مسکونی متفاوت باشد) / Billing address</td>
      <td style="border:1px solid #cbd5e1;padding:8px;vertical-align:top;">{{billingAddress}}</td>
    </tr>
  </table>

  <div style="background:#e5e7eb;border:1px solid #94a3b8;padding:6px 10px;font-weight:700;font-size:12px;">6. جزئیات خدمات · Service details</div>
  <table style="width:100%;border-collapse:collapse;border:1px solid #cbd5e1;font-size:12px;margin-bottom:12px;">
    <tr>
      <td style="border:1px solid #cbd5e1;padding:8px;width:32%;background:#f8fafc;font-weight:600;">نام پلان / Plan name</td>
      <td style="border:1px solid #cbd5e1;padding:8px;">{{planName}}</td>
    </tr>
    <tr>
      <td style="border:1px solid #cbd5e1;padding:8px;background:#f8fafc;font-weight:600;">نوع خدمات / Service type</td>
      <td style="border:1px solid #cbd5e1;padding:8px;">{{serviceType}}</td>
    </tr>
    <tr>
      <td style="border:1px solid #cbd5e1;padding:8px;background:#f8fafc;font-weight:600;">روش تحویل / Delivery (SIM / eSIM / etc.)</td>
      <td style="border:1px solid #cbd5e1;padding:8px;">{{serviceDelivery}}</td>
    </tr>
  </table>

  <div style="background:#e5e7eb;border:1px solid #94a3b8;padding:6px 10px;font-weight:700;font-size:12px;">7. معلومات هزینه · Charges &amp; billing</div>
  <table style="width:100%;border-collapse:collapse;border:1px solid #cbd5e1;font-size:12px;margin-bottom:12px;">
    <tr>
      <td style="border:1px solid #cbd5e1;padding:8px;width:32%;background:#f8fafc;font-weight:600;">هزینه فعال‌سازی یکبار / Activation</td>
      <td style="border:1px solid #cbd5e1;padding:8px;">{{activationFee}}</td>
    </tr>
    <tr>
      <td style="border:1px solid #cbd5e1;padding:8px;background:#f8fafc;font-weight:600;">هزینه دوره‌ای / Recurring charge</td>
      <td style="border:1px solid #cbd5e1;padding:8px;">{{monthlyFee}}</td>
    </tr>
    <tr>
      <td style="border:1px solid #cbd5e1;padding:8px;background:#f8fafc;font-weight:600;">دوره صورتحساب / Billing cycle</td>
      <td style="border:1px solid #cbd5e1;padding:8px;">{{billingCycle}}</td>
    </tr>
  </table>

  <div style="background:#f1f5f9;border:1px solid #cbd5e1;padding:10px 12px;font-size:12px;margin-top:8px;">
    <p style="margin:0 0 8px;font-weight:700;">اعلامیه · Declaration</p>
    <p style="margin:0;">I confirm that the above information is true and valid, and consistent with my identification documents. I have read and agree to the current tariff and network access rules. Signature date: {{submissionDate}} &nbsp;|&nbsp; Customer signature: ____________________</p>
    <p style="margin:8px 0 0;font-size:11px;color:#64748b;">Subscriber acknowledgement bound to <strong>{{fullName}}</strong> / ID <strong>{{idNumber}}</strong></p>
  </div>
</div>
`.trim();

/** Enterprise broadband CAF — comprehensive template with service terms */
const ENTERPRISE_CAF_BLUEPRINT = `
<div style="text-align: center; border-bottom: 3px solid #1229B3; padding-bottom: 20px; margin-bottom: 30px;">
  <h1 style="color: #1229B3; font-size: 24px; font-weight: bold; margin: 0;">ATOMA TELECOM</h1>
  <p style="color: #666; font-size: 14px; margin: 5px 0 0 0; font-weight: bold;">فورم درخواست خدمات باند پهن شرکتی</p>
  <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">ENTERPRISE BROADBAND SERVICE APPLICATION FORM</p>
</div>

<h2 style="color: #1229B3; font-size: 18px; border-left: 4px solid #1229B3; padding-left: 10px; margin-top: 30px;">معلومات متقاضی / Applicant Information</h2>

<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
  <tr>
    <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9; width: 30%; font-weight: bold;">نام شرکت / Company Name</td>
    <td style="padding: 10px; border: 1px solid #ddd;">{{fullName}}</td>
  </tr>
  <tr>
    <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;">شماره ثبت / Registration Number</td>
    <td style="padding: 10px; border: 1px solid #ddd;">{{idNumber}}</td>
  </tr>
  <tr>
    <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;">نوع شرکت / Company Type</td>
    <td style="padding: 10px; border: 1px solid #ddd;">{{idType}}</td>
  </tr>
  <tr>
    <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;">آدرس ثبت شده / Registered Address</td>
    <td style="padding: 10px; border: 1px solid #ddd;">{{address}}</td>
  </tr>
  <tr>
    <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;">شماره تماس / Contact Number</td>
    <td style="padding: 10px; border: 1px solid #ddd;">{{contactNumber}}</td>
  </tr>
  <tr>
    <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;">ایمیل / Email</td>
    <td style="padding: 10px; border: 1px solid #ddd;">{{email}}</td>
  </tr>
</table>

<h2 style="color: #1229B3; font-size: 18px; border-left: 4px solid #1229B3; padding-left: 10px; margin-top: 30px;">معلومات خدمات درخواستی / Requested Service Information</h2>

<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
  <tr>
    <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9; width: 30%; font-weight: bold;">نوع خدمات / Service Type</td>
    <td style="padding: 10px; border: 1px solid #ddd;">{{serviceType}}</td>
  </tr>
  <tr>
    <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;">نام پلان / Plan Name</td>
    <td style="padding: 10px; border: 1px solid #ddd;">{{planName}}</td>
  </tr>
  <tr>
    <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;">روش اتصال / Connection Method</td>
    <td style="padding: 10px; border: 1px solid #ddd;">{{serviceDelivery}}</td>
  </tr>
  <tr>
    <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;">دوره صورتحساب / Billing Cycle</td>
    <td style="padding: 10px; border: 1px solid #ddd;">{{billingCycle}}</td>
  </tr>
  <tr>
    <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;">هزینه فعال‌سازی / Activation Fee</td>
    <td style="padding: 10px; border: 1px solid #ddd;">{{activationFee}}</td>
  </tr>
  <tr>
    <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;">هزینه ماهانه / Monthly Fee</td>
    <td style="padding: 10px; border: 1px solid #ddd;">{{monthlyFee}}</td>
  </tr>
</table>

<h2 style="color: #1229B3; font-size: 18px; border-left: 4px solid #1229B3; padding-left: 10px; margin-top: 30px;">شرایط خدمات و تعهدات / Service Terms and Commitments</h2>

<div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
  <h3 style="color: #333; font-size: 14px; margin-top: 0;">قرارداد خدمات / Service Agreement</h3>
  <p style="line-height: 1.8; color: #666; font-size: 13px;">
    I, on behalf of <strong>{{fullName}}</strong>, apply for enterprise broadband services provided by ATOMA TELECOM and commit to:
  </p>
  <ol style="line-height: 1.8; color: #666; font-size: 13px;">
    <li>All provided company information and related documents are authentic and valid. I am willing to bear corresponding legal responsibilities for any false information;</li>
    <li>I have fully understood the tariff standards, service content, and related terms of the applied service;</li>
    <li>I agree to comply with ATOMA TELECOM's service agreement and related management regulations;</li>
    <li>I guarantee not to use the applied network service for illegal activities;</li>
    <li>I will pay service fees on time. If overdue, I agree that the operator may take measures such as service suspension.</li>
  </ol>

  <h3 style="color: #333; font-size: 14px; margin-top: 20px;">تعهد سطح خدمات (SLA) / Service Level Agreement</h3>
  <p style="line-height: 1.8; color: #666; font-size: 13px;">
    ATOMA TELECOM commits to providing the following service guarantees for enterprise customers:
  </p>
  <ul style="line-height: 1.8; color: #666; font-size: 13px;">
    <li><strong>Network Availability / دسترسی شبکه</strong>: ≥99.5% (Dedicated line ≥99.9%)</li>
    <li><strong>Fault Response Time / زمان پاسخ به خرابی</strong>: Response within 2 hours, repair within 24 hours</li>
    <li><strong>Technical Support / پشتیبانی فنی</strong>: 7×24 customer service hotline</li>
    <li><strong>Bandwidth Guarantee / تضمین پهنای باند</strong>: Committed bandwidth not less than 95% of package standard</li>
  </ul>

  <h3 style="color: #333; font-size: 14px; margin-top: 20px;">توضیحات هزینه / Fee Description</h3>
  <p style="line-height: 1.8; color: #666; font-size: 13px;">
    <strong>Activation Fee / هزینه فعال‌سازی</strong>: {{activationFee}} (One-time charge, non-refundable)<br>
    <strong>Monthly Fee / هزینه ماهانه</strong>: {{monthlyFee}}<br>
    <strong>Billing Cycle / دوره صورتحساب</strong>: {{billingCycle}}<br>
    <strong>Payment Methods / روش‌های پرداخت</strong>: Bank transfer, check, online payment, etc.<br>
    <strong>Deposit Policy / سیاست سپرده</strong>: Based on credit assessment, a deposit equivalent to 2-3 months' rent may be required
  </p>

  <h3 style="color: #333; font-size: 14px; margin-top: 20px;">مسئولیت نقض قرارداد / Breach of Contract Liability</h3>
  <p style="line-height: 1.8; color: #666; font-size: 13px;">
    If the customer violates the service agreement or engages in illegal activities, ATOMA TELECOM has the right to immediately suspend the service and reserves the right to pursue legal liability. Paid fees will not be refunded.
  </p>

  <h3 style="color: #333; font-size: 14px; margin-top: 20px;">حفاظت از حریم خصوصی / Privacy Protection</h3>
  <p style="line-height: 1.8; color: #666; font-size: 13px;">
    ATOMA TELECOM commits to strictly protecting customer information security and will not disclose customer data to third parties, except as required by laws, regulations, or regulatory authorities.
  </p>
</div>

<h2 style="color: #1229B3; font-size: 18px; border-left: 4px solid #1229B3; padding-left: 10px; margin-top: 30px;">اعلامیه متقاضی / Applicant Declaration</h2>

<div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
  <p style="line-height: 1.8; color: #856404; font-size: 13px; margin: 0;">
    <strong>Important Declaration:</strong> I, as the authorized representative of <strong>{{fullName}}</strong>, have carefully read and fully understand all the above terms, and agree to accept ATOMA TELECOM's service agreement and related regulations. I confirm that all information provided is true, accurate, and complete, and I am willing to bear all legal responsibilities arising from false information.
  </p>
</div>

<div style="margin-top: 40px;">
  <p style="color: #666; font-size: 13px; line-height: 1.8;">
    <strong>Application Date / تاریخ درخواست</strong>: {{submissionDate}}<br>
    <strong>Application Number / شماره درخواست</strong>: Auto-generated by system<br>
    <strong>Service Center / مرکز خدمات</strong>: ATOMA TELECOM Enterprise Service Center
  </p>
</div>

<div style="margin-top: 50px; page-break-inside: avoid;">
  <table style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="width: 50%; padding: 20px; vertical-align: top;">
        <p style="font-weight: bold; color: #333; margin-bottom: 10px;">امضای نماینده مجاز / Authorized Representative Signature:</p>
        <div style="border-bottom: 2px solid #333; height: 60px; margin-bottom: 10px;"></div>
        <p style="color: #666; font-size: 12px;">Name / نام: ___________________</p>
        <p style="color: #666; font-size: 12px;">Position / موقعیت: ___________________</p>
        <p style="color: #666; font-size: 12px;">Date / تاریخ: ___________________</p>
      </td>
      <td style="width: 50%; padding: 20px; vertical-align: top;">
        <p style="font-weight: bold; color: #333; margin-bottom: 10px;">مهر شرکت / Company Seal:</p>
        <div style="border: 2px dashed #ccc; height: 100px; display: flex; align-items: center; justify-content: center; color: #999; font-size: 12px;">
          (Company Seal)
        </div>
      </td>
    </tr>
  </table>
</div>

<div style="margin-top: 50px; padding-top: 20px; border-top: 2px solid #1229B3; text-align: center;">
  <p style="color: #999; font-size: 11px; line-height: 1.6;">
    ATOMA TELECOM Enterprise Service Center<br>
    Customer Service Hotline: +93 XXX XXX XXX | Enterprise Email: enterprise@atoma.af<br>
    Address: Kabul, Afghanistan<br>
    <br>
    <em style="font-size: 10px;">This application form is in duplicate, one for the customer and one for the operator.</em>
  </p>
</div>
`.trim();

const templates = [
  {
    id: 'TPL-IND-PRE-001',
    name: 'Individual Prepaid Basic',
    description:
      'Structured individual CAF blueprint: customer name, ID, residential & billing address, contact, service plan, and charges — table layout with CRM placeholders.',
    customerType: 'Individual',
    businessType: 'SIM Registration',
    channel: 'Direct',
    product: 'Prepaid Standard',
    isActive: true,
    lastModified: '2024-04-01T08:00:00Z',
    fields: [
      { id: 'f1', label: 'Full Name', type: 'text', required: true },
      { id: 'f2', label: 'ID Type', type: 'text', required: true },
      { id: 'f3', label: 'ID Number', type: 'text', required: true },
      { id: 'f4', label: 'Residential Address', type: 'textarea', required: true },
      { id: 'f5', label: 'Contact Number', type: 'text', required: true },
      { id: 'f6', label: 'Email', type: 'text', required: false },
      { id: 'f7', label: 'Billing Address', type: 'textarea', required: false },
      { id: 'f8', label: 'Plan Name', type: 'text', required: true },
      { id: 'f9', label: 'Service Type', type: 'text', required: true },
      { id: 'f10', label: 'Service Delivery', type: 'text', required: false },
      { id: 'f11', label: 'Activation Fee', type: 'text', required: false },
      { id: 'f12', label: 'Monthly Fee', type: 'text', required: false },
      { id: 'f13', label: 'Billing Cycle', type: 'text', required: false },
    ],
    termsAndConditions: INDIVIDUAL_CAF_BLUEPRINT,
  },
  {
    id: 'TPL-CORP-POST-002',
    name: 'Corporate Postpaid Enterprise',
    description: 'Enterprise broadband service application with comprehensive terms, SLA commitments, and bilingual Arabic/English format.',
    customerType: 'Corporate',
    businessType: 'Enterprise Broadband Service',
    channel: 'Direct',
    product: 'Enterprise Fiber / Leased Line',
    isActive: true,
    lastModified: '2024-04-10T14:30:00Z',
    fields: [
      { id: 'c1', label: 'نام شرکت / Company Name', type: 'text', required: true },
      { id: 'c2', label: 'شماره ثبت / Registration Number', type: 'text', required: true },
      { id: 'c3', label: 'نوع شرکت / Company Type', type: 'select', required: true, options: ['Limited Company', 'Joint Stock Company', 'Sole Proprietorship', 'Other'] },
      { id: 'c4', label: 'آدرس ثبت شده / Registered Address', type: 'textarea', required: true },
      { id: 'c5', label: 'شماره تماس / Contact Number', type: 'text', required: true },
      { id: 'c6', label: 'ایمیل / Email', type: 'text', required: true },
      { id: 'c7', label: 'نام نماینده قانونی / Legal Representative Name', type: 'text', required: false },
      { id: 'c8', label: 'شماره شناسنامه نماینده / Representative ID Number', type: 'text', required: false },
      { id: 'c9', label: 'نام نماینده مجاز / Authorized Representative Name', type: 'text', required: false },
      { id: 'c10', label: 'تلفون نماینده / Representative Phone', type: 'text', required: false },
      { id: 'c11', label: 'نوع خدمات / Service Type', type: 'select', required: true, options: ['Enterprise Broadband', 'Dedicated Line', 'Hybrid Access'] },
      { id: 'c12', label: 'نام پلان / Plan Name', type: 'text', required: true },
      { id: 'c13', label: 'نیاز پهنای باند / Bandwidth Requirement', type: 'select', required: false, options: ['10M', '50M', '100M', '200M', '1000M'] },
      { id: 'c14', label: 'آدرس اتصال / Connection Address', type: 'textarea', required: false },
      { id: 'c15', label: 'نیاز به IP ثابت / Fixed IP Required', type: 'checkbox', required: false },
      { id: 'c16', label: 'تعداد آدرس IP / Number of IP Addresses', type: 'number', required: false },
      { id: 'c17', label: 'تماس فنی / Technical Contact', type: 'text', required: false },
      { id: 'c18', label: 'تلفون فنی / Technical Phone', type: 'text', required: false },
      { id: 'c19', label: 'تماس مالی / Financial Contact', type: 'text', required: false },
      { id: 'c20', label: 'تلفون مالی / Financial Phone', type: 'text', required: false },
      { id: 'c21', label: 'هزینه فعال‌سازی / Activation Fee', type: 'text', required: false },
      { id: 'c22', label: 'هزینه ماهانه / Monthly Fee', type: 'text', required: false },
      { id: 'c23', label: 'دوره صورتحساب / Billing Cycle', type: 'text', required: false },
      { id: 'c24', label: 'روش اتصال / Connection Method', type: 'text', required: false },
      { id: 'c25', label: 'توضیحات ویژه / Special Requirements', type: 'textarea', required: false },
    ],
    termsAndConditions: ENTERPRISE_CAF_BLUEPRINT,
  },
  {
    id: 'TPL-PCCARE-CAF-001',
    name: 'PC CARE Customer Application Form (CAF)',
    description:
      'Airway broadband CAF (SME/ISP/OSP/Corporate/Lease Line) with grid-style fields, service/financial blocks, document checklist, and customer acceptance — logo from image/logo.svg.',
    customerType: 'Corporate',
    businessType: 'Broadband / Lease Line',
    channel: 'Direct',
    product: 'Fixed Wi-Fi / FTTX / DIA-ILL',
    isActive: true,
    lastModified: '2026-05-01T10:00:00Z',
    isFullPageTerms: true,
    fields: [
      { id: 'pc1', label: 'Subscriber Name', type: 'text', required: true },
      { id: 'pc2', label: 'Licence Details (ISP/OSP)', type: 'text', required: false },
      { id: 'pc3', label: 'Connection Installation Address', type: 'textarea', required: true },
      { id: 'pc4', label: 'Mobile No. (Registered)', type: 'text', required: true },
      { id: 'pc5', label: 'Email id (Registered)', type: 'text', required: true },
      { id: 'pc6', label: 'Authorised Signatory', type: 'text', required: true },
      { id: 'pc7', label: 'Technical Coordinator', type: 'text', required: false },
      { id: 'pc8', label: 'Billing Coordinator', type: 'text', required: false },
      {
        id: 'pc9',
        label: 'Required Service',
        type: 'select',
        required: true,
        options: ['Fixed Wi-Fi Broadband', 'FTTX (FiberOne)', 'Internet Leaseline (DIA-ILL)'],
      },
      {
        id: 'pc10',
        label: 'Subscriber Type',
        type: 'select',
        required: true,
        options: ['Prepaid', 'Post Pay'],
      },
      {
        id: 'pc11',
        label: 'Billing Cycle',
        type: 'select',
        required: true,
        options: ['Monthly', 'Quarterly', 'Half Yearly', 'Yearly'],
      },
      { id: 'pc12', label: 'Static Public IP', type: 'checkbox', required: false },
    ],
    termsAndConditions: '__BUILD_PCCARE_CAF__',
  },
];

const outDir = path.join(root, 'data');
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'template_data.json');
fs.writeFileSync(outPath, JSON.stringify({ templates }, null, 2), 'utf8');
console.log('Wrote', outPath);
