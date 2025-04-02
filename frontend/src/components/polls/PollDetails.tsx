import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { Backend_URL } from "../../contant";

interface Poll {
  _id: string;
  title: string;
  description: string;
  options: Array<{ _id: string; text: string; votes: number }>;
  totalVotes: number;
  createdBy: { username: string };
  createdAt: string;
  endDate: string;
  isActive: boolean;
  votedBy: string[];
}

const PollDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    fetchPoll();
  }, [id]);

  const fetchPoll = async () => {
    try {
      const response = await axios.get(`${Backend_URL}/api/polls/${id}`);
      setPoll(response.data);
      if (user && response.data.votedBy.includes(user.id)) {
        setHasVoted(true);
      }
    } catch (error) {
      toast.error("Failed to fetch poll details");
      navigate("/polls");
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!selectedOption) {
      toast.error("Please select an option");
      return;
    }

    try {
      await axios.post(`${Backend_URL}/api/polls/${id}/vote`, {
        optionId: selectedOption,
      });
      toast.success("Vote submitted successfully");
      setHasVoted(true);
      fetchPoll();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit vote");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeLeft = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d left`;
    if (hours > 0) return `${hours}h left`;
    return `${minutes}m left`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Poll not found</h2>
          <button
            onClick={() => navigate("/polls")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition duration-200"
          >
            Back to Polls
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {poll.title}
                </h1>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    {poll.createdBy.username}
                  </div>
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {getTimeLeft(poll.endDate)}
                  </div>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  poll.isActive
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                {poll.isActive ? "Active" : "Ended"}
              </span>
            </div>

            <p className="text-gray-300 mb-8">{poll.description}</p>

            <div className="space-y-4 mb-8">
              {poll.options.map((option) => {
                const percentage =
                  poll.totalVotes > 0
                    ? (option.votes / poll.totalVotes) * 100
                    : 0;
                return (
                  <div key={option._id} className="relative">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">{option.text}</span>
                      <span className="text-gray-400">
                        {option.votes} votes
                      </span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {!user ? (
              <div className="text-center py-6">
                <p className="text-gray-400 mb-4">Please log in to vote</p>
                <button
                  onClick={() => navigate("/login")}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition duration-200"
                >
                  Log In
                </button>
              </div>
            ) : hasVoted ? (
              <div className="text-center py-6">
                <p className="text-gray-400">
                  You have already voted on this poll
                </p>
              </div>
            ) : !poll.isActive ? (
              <div className="text-center py-6">
                <p className="text-gray-400">This poll has ended</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {poll.options.map((option) => (
                    <label
                      key={option._id}
                      className={`relative flex items-center p-4 rounded-lg border-2 cursor-pointer transition duration-200 ${
                        selectedOption === option._id
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-gray-700 hover:border-gray-600"
                      }`}
                    >
                      <input
                        type="radio"
                        name="option"
                        value={option._id}
                        checked={selectedOption === option._id}
                        onChange={(e) => setSelectedOption(e.target.value)}
                        className="sr-only"
                      />
                      <span className="text-gray-300">{option.text}</span>
                    </label>
                  ))}
                </div>
                <button
                  onClick={handleVote}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition duration-200 font-medium"
                >
                  Submit Vote
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PollDetails;
