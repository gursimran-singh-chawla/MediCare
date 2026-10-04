const pendingDoctorQuery = {
  $or: [
    { status: 'pending' },
    { status: { $exists: false } }
  ]
};

function doctorAppointmentsQuery(doctor) {
  return {
    $or: [
      { doctor: doctor._id },
      { doctorEmail: doctor.email }
    ]
  };
}

module.exports = { pendingDoctorQuery, doctorAppointmentsQuery };
