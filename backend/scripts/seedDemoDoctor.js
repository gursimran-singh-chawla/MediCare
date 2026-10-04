require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Review = require('../models/Review');
const User = require('../models/user');

const DOCTOR_PASSWORD = 'doctor123';
const PATIENT = { name: 'Riya Sharma', email: 'patient@medicare.com', password: 'patient123', age: 24, gender: 'Female' };

const doctors = [
  { name: 'Arjun Verma', email: 'doctor@medicare.com', specialization: 'Cardiologist', degree: 'MBBS, MD (Cardiology)', experience: 12, price: 15, image: '/doctors/doctor-2.jpg' },
  { name: 'Neha Kulkarni', email: 'neha.kulkarni@medicare.com', specialization: 'Dermatologist', degree: 'MBBS, MD (Dermatology)', experience: 8, price: 10, image: '/doctors/doctor-1.jpg' },
  { name: 'Sanjay Rao', email: 'sanjay.rao@medicare.com', specialization: 'Orthopedic', degree: 'MBBS, MS (Orthopaedics)', experience: 20, price: 20, image: '/doctors/doctor-4.jpg' },
  { name: 'Priya Menon', email: 'priya.menon@medicare.com', specialization: 'Neurologist', degree: 'MBBS, DM (Neurology)', experience: 15, price: 18, image: '/doctors/doctor-3.jpg' },
  { name: 'Rahul Bansal', email: 'rahul.bansal@medicare.com', specialization: 'General Physician', degree: 'MBBS', experience: 5, price: 5, image: '/doctors/doctor-2.jpg' },
  { name: 'Kavya Reddy', email: 'kavya.reddy@medicare.com', specialization: 'Dentist', degree: 'BDS, MDS', experience: 7, price: 8, image: '/doctors/doctor-1.jpg' }
];

const patients = [
  ['Aarav Mehta', 'aarav.mehta@example.com', '9876500001'],
  ['Diya Sharma', 'diya.sharma@example.com', '9876500002'],
  ['Kabir Singh', 'kabir.singh@example.com', '9876500003'],
  ['Ananya Iyer', 'ananya.iyer@example.com', '9876500004'],
  ['Rohan Gupta', 'rohan.gupta@example.com', '9876500005'],
  ['Meera Nair', 'meera.nair@example.com', '9876500006'],
  ['Vihaan Patel', 'vihaan.patel@example.com', '9876500007'],
  ['Isha Kapoor', 'isha.kapoor@example.com', '9876500008']
];

// Calendar data for the main demo doctor: [day offset from today, time, payment status]
const schedule = [
  [-6, '10:00', 'paid'], [-5, '15:00', 'paid'], [-3, '09:30', 'paid'], [-2, '11:00', 'failed'],
  [-1, '14:00', 'paid'], [-1, '17:00', 'paid'],
  [0, '09:00', 'paid'], [0, '10:30', 'paid'], [0, '12:00', 'pending'], [0, '16:00', 'paid'],
  [1, '09:30', 'paid'], [1, '11:30', 'paid'], [1, '15:00', 'pending'],
  [2, '10:00', 'paid'], [2, '14:00', 'paid'], [2, '18:00', 'paid'],
  [3, '09:00', 'paid'], [3, '12:00', 'failed'], [4, '11:00', 'paid'], [4, '16:00', 'paid'],
  [6, '10:30', 'paid'], [8, '15:00', 'paid'], [9, '09:30', 'pending'], [12, '11:00', 'paid'], [15, '17:00', 'paid']
];

const reviewTexts = [
  [5, 'Very patient and explained everything clearly. Felt reassured after the call.'],
  [5, 'Excellent consultation, the prescription worked within days. Highly recommend!'],
  [4, 'Good doctor, listened carefully. The call started a few minutes late.'],
  [5, 'Friendly, professional and to the point. Booking was super easy too.'],
  [4, 'Helpful advice and a clear treatment plan. Would consult again.'],
  [3, 'Decent consultation but felt a bit rushed.'],
  [5, 'Best online consultation I have had. Thank you doctor!']
];

function isoDate(offset) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function appointmentFor(doctor, [patientName, patientEmail, patientPhone], date, time, paymentStatus, tag) {
  const paid = paymentStatus === 'paid';
  return {
    patientName,
    patientEmail,
    patientPhone,
    doctor: doctor._id,
    doctorName: doctor.name,
    doctorEmail: doctor.email,
    doctorSpecialization: doctor.specialization,
    date,
    time,
    paymentStatus,
    appointmentStatus: paid ? 'confirmed' : paymentStatus === 'failed' ? 'cancelled' : 'pending_payment',
    amount: doctor.price * 5,
    paymentId: paid ? `pay_demo_${tag}` : undefined,
    orderId: `order_demo_${tag}`,
    paidAt: paid ? new Date() : undefined,
    receiptNumber: paid ? `RCPT-DEMO-${tag}` : undefined,
    meetingLink: paid ? `https://meet.jit.si/medicare-demo-${tag}` : undefined
  };
}

async function seedDemoData({ quiet = false } = {}) {
  const doctorHash = await bcrypt.hash(DOCTOR_PASSWORD, 10);

  const savedDoctors = [];
  for (const info of doctors) {
    savedDoctors.push(await Doctor.findOneAndUpdate(
      { email: info.email },
      {
        ...info,
        password: doctorHash,
        phone: '9876543210',
        aadhar: '123412341234',
        medicalLicense: `MCI-DEMO-${info.experience}${info.price}`,
        address: 'MediCare Clinic, Connaught Place, New Delhi',
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        document: info.image,
        certificates: [],
        status: 'approved',
        approvedAt: new Date(),
        rejectionReason: undefined
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ));
  }

  const patient = await User.findOneAndUpdate(
    { email: PATIENT.email },
    { ...PATIENT, password: await bcrypt.hash(PATIENT.password, 10) },
    { upsert: true, new: true }
  );

  const doctorIds = savedDoctors.map((doctor) => doctor._id);
  const demoEmails = doctors.map((doctor) => doctor.email);
  await Appointment.deleteMany({ $or: [{ doctor: { $in: doctorIds } }, { doctorEmail: { $in: demoEmails } }, { patientEmail: PATIENT.email }] });
  await Review.deleteMany({ doctor: { $in: doctorIds } });

  const [main, derma, ortho] = savedDoctors;
  const patientTuple = [PATIENT.name, PATIENT.email, '9876512345'];
  const appointments = schedule.map(([offset, time, status], index) => appointmentFor(main, patients[index % patients.length], isoDate(offset), time, status, `A${index + 1}`));
  appointments.push(
    appointmentFor(main, patientTuple, isoDate(-4), '12:00', 'paid', 'P1'),
    appointmentFor(derma, patientTuple, isoDate(-9), '11:00', 'paid', 'P2'),
    appointmentFor(ortho, patientTuple, isoDate(3), '15:00', 'paid', 'P3'),
    appointmentFor(derma, patientTuple, isoDate(5), '10:00', 'pending', 'P4')
  );
  await Appointment.insertMany(appointments);

  const reviews = [];
  savedDoctors.forEach((doctor, doctorIndex) => {
    const total = 3 + ((doctorIndex * 2) % 5);
    for (let index = 0; index < total; index += 1) {
      const [rating, comment] = reviewTexts[(doctorIndex + index) % reviewTexts.length];
      const daysAgo = 2 + index * 4 + doctorIndex;
      reviews.push({
        doctor: doctor._id,
        user: new mongoose.Types.ObjectId(),
        patientName: patients[(doctorIndex + index) % patients.length][0],
        rating,
        comment,
        createdAt: new Date(Date.now() - daysAgo * 86400000),
        updatedAt: new Date(Date.now() - daysAgo * 86400000)
      });
    }
  });
  reviews.push({ doctor: derma._id, user: patient._id, patientName: PATIENT.name, rating: 4, comment: 'Cleared up my skin issue quickly. Very kind doctor.', createdAt: new Date(), updatedAt: new Date() });
  await Review.insertMany(reviews, { timestamps: false });

  if (!quiet) {
    console.log('Demo data ready:');
    console.log(`  Doctor : ${main.email} / ${DOCTOR_PASSWORD}  (+${savedDoctors.length - 1} more demo doctors, same password)`);
    console.log(`  Patient: ${PATIENT.email} / ${PATIENT.password}`);
    console.log(`  ${appointments.length} appointments, ${reviews.length} reviews`);
  }
  return { doctors: savedDoctors.length, appointments: appointments.length, reviews: reviews.length };
}

const DEMO_CREDENTIALS = {
  admin: { email: 'admin', password: 'admin' },
  doctor: { email: doctors[0].email, password: DOCTOR_PASSWORD },
  patient: { email: PATIENT.email, password: PATIENT.password }
};

module.exports = { seedDemoData, DEMO_CREDENTIALS };

if (require.main === module) {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medicare')
    .then(() => seedDemoData())
    .then(() => mongoose.disconnect())
    .catch(async (error) => {
      console.error(error);
      await mongoose.disconnect();
      process.exit(1);
    });
}
