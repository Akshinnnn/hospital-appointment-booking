import React from "react";

// Example feedback data
const feedbacks = [
  {
    name: "John Doe",
    feedback: "MediCare is amazing! The doctors are professional and the service is fast. Highly recommend!",
    avatar: "https://i.pravatar.cc/100?img=1",
  },
  {
    name: "Sarah Smith",
    feedback: "I had a wonderful experience booking an appointment online. Very convenient and reliable.",
    avatar: "https://i.pravatar.cc/100?img=2",
  },
  {
    name: "Michael Johnson",
    feedback: "The free consulting helped me a lot. The staff is very friendly and knowledgeable.",
    avatar: "https://i.pravatar.cc/100?img=3",
  },
];

const FeedbackSection = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold mb-6 text-green-700">What Our Patients Say</h2>
        <p className="text-gray-600 mb-12 text-lg">
          Hear from our patients about their experience with MediCare. Your trust is our priority!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {feedbacks.map((item, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-2xl shadow-md flex flex-col items-center text-center hover:scale-105 transition-transform"
            >
              <img
                src={item.avatar}
                alt={item.name}
                className="w-20 h-20 rounded-full mb-4 object-cover"
              />
              <p className="text-gray-700 mb-4">"{item.feedback}"</p>
              <h3 className="text-lg font-semibold text-green-700">{item.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeedbackSection;
