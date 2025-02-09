import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getServices } from "../../api/apiService";
import Layout from "../../layout/Layout";

const mockTherapists = [
  { id: "1", name: "Dr. Alice" },
  { id: "2", name: "Dr. Bob" },
];

const mockSchedules: Record<string, string[]> = {
  "1": ["09:00 AM", "10:00 AM", "02:00 PM"],
  "2": ["11:00 AM", "01:00 PM", "03:00 PM"],
};

const BookingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [therapists, setTherapists] = useState(mockTherapists);
  const [selectedTherapist, setSelectedTherapist] = useState<any | null>(null);
  const [schedule, setSchedule] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await getServices();
        const foundService = response.data.find((s: any) => s.id === id);
        setService(foundService || null);
      } catch (error) {
        console.error("Error fetching service:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [id]);

  const handleTherapistSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const therapistId = event.target.value;
    const therapist = therapists.find(t => t.id === therapistId);
    setSelectedTherapist(therapist);
    setSchedule(mockSchedules[therapistId] || []);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!customerName || !customerPhone || !selectedDate || !selectedTherapist || !selectedSlot) {
      alert("Please fill in all fields before booking.");
      return;
    }
    navigate("/checkout", {
      state: {
        service,
        customerName,
        customerPhone,
        selectedDate,
        selectedTherapist,
        selectedSlot,
      },
    });
  };

  return (
    <Layout>
      <div className="container mx-auto py-16">
        <h2 className="text-4xl font-bold text-center mb-10">Booking Service</h2>

        <div className="flex flex-wrap -mx-4">
          <div className="w-full lg:w-1/3 px-4 mb-8 lg:mb-0">
            {loading ? (
              <p className="text-lg text-gray-600">Loading service details...</p>
            ) : service ? (
              <>
                <h3 className="text-2xl font-semibold mb-4">{service.name}</h3>
                <img src={service.image} alt={service.name} className="w-full h-auto rounded-lg shadow-lg mb-6" />
                <p className="text-lg text-gray-600 mb-4">{service.description}</p>
                <p className="text-xl font-bold text-gray-900">Price: {service.price}</p>
              </>
            ) : (
              <p className="text-lg text-red-600">Service not found. Please try again.</p>
            )}
          </div>

          <div className="w-full lg:w-2/3 px-4">
            <h3 className="text-2xl font-semibold mb-4">Booking Form</h3>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-lg text-gray-700">Name</label>
                <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Enter your name" className="w-full p-3 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-lg text-gray-700">Phone Number</label>
                <input type="text" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Enter your phone number" className="w-full p-3 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-lg text-gray-700">Choose Date</label>
                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-lg text-gray-700">Select Therapist</label>
                <select onChange={handleTherapistSelect} className="w-full p-3 border border-gray-300 rounded-lg">
                  <option value="">Choose a therapist</option>
                  {therapists.map((therapist) => (
                    <option key={therapist.id} value={therapist.id}>
                      {therapist.name}
                    </option>
                  ))}
                </select>
              </div>
              {selectedTherapist && schedule.length > 0 && (
                <div>
                  <h4 className="text-xl font-semibold mb-2">Available Time Slots</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {schedule.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        className={`p-2 border rounded-lg ${selectedSlot === slot ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                        onClick={() => setSelectedSlot(slot)}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <button type="submit" className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300">
                  Book Now
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BookingPage;
