import { useState, useEffect } from "react";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { fetchProject } from "../../store/slices/studentSlice";

const AIViva = () => {
  const dispatch = useDispatch();
  const project = useSelector((state) => state.student.project);
  const projectId = project?._id;

  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [finalResult, setFinalResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔥 Ensure project is loaded
  useEffect(() => {
    if (!project) {
      dispatch(fetchProject());
    }
  }, [project, dispatch]);

  console.log("PROJECT:", project);
  console.log("PROJECT ID:", project?._id);

  // 🟢 Start Viva
  const startViva = async () => {
    if (!projectId) {
      toast.error("Project not found. Please submit project first.");
      return;
    }

    try {
      setLoading(true);

      const res = await axiosInstance.post(`/viva/${projectId}/start`);

      setSessionId(res.data.data.sessionId);
      setQuestions(res.data.data.questions);
      toast.success("Viva Started Successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to start viva");
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Submit Answer
  const submitAnswer = async () => {
    if (!answer.trim()) {
      toast.error("Please enter your answer");
      return;
    }

    try {
      setLoading(true);

      const res = await axiosInstance.post(`/viva/${sessionId}/answer`, {
        answer,
      });

      setFeedback(res.data.data.feedback);

      // If completed → fetch result
      if (res.data.data.completed) {
        const result = await axiosInstance.get(`/viva/${sessionId}/result`);

        setFinalResult(result.data.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit answer");
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = () => {
    setAnswer("");
    setFeedback(null);
    setCurrentIndex((prev) => prev + 1);
  };

  const fetchFinalResult = async () => {
    try {
      // console.log("RESULT RESPONSE:", result.data);

      setLoading(true);

      const result = await axiosInstance.get(`/viva/${sessionId}/result`);

      setFinalResult(result.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch result");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🤖 AI Viva Examination</h1>

      {!sessionId && (
        <button
          onClick={startViva}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Starting..." : "Start Viva"}
        </button>
      )}

      {sessionId && questions.length > 0 && !finalResult && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">
            Question {currentIndex + 1}:
          </h2>

          <p className="mb-4">{questions[currentIndex]}</p>

          <textarea
            className="w-full border p-2 rounded mb-4"
            rows={4}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />

          {!feedback && (
            <button
              onClick={submitAnswer}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              {loading ? "Submitting..." : "Submit Answer"}
            </button>
          )}

          {feedback && (
            <div className="mt-4 bg-gray-100 p-4 rounded">
              <h3 className="font-semibold">AI Feedback:</h3>
              <pre className="whitespace-pre-wrap">{feedback}</pre>

              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={nextQuestion}
                  className="mt-3 bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Next Question
                </button>
              ) : (
                <button
                  onClick={fetchFinalResult}
                  className="mt-3 bg-purple-600 text-white px-4 py-2 rounded"
                >
                  {loading ? "Loading..." : "View Final Result"}
                </button>
              )}
            </div>
          )}
        </div>
      )}
{finalResult && (
  <div className="mt-6 bg-green-100 p-6 rounded">
    <h2 className="text-xl font-bold mb-4">
      🎓 Final Viva Result
    </h2>

    {/* Marks Section */}
    <div className="mb-4">
      <p className="text-lg font-semibold">
        Score: {finalResult.score} / {finalResult.total}
      </p>

      <p className="text-md">
        Percentage: {finalResult.percentage}%
      </p>
    </div>

    {/* Feedback Section */}
    {/* <div className="bg-white p-4 rounded shadow"> */}
      {/* <h3 className="font-semibold mb-2">Overall Feedback:</h3> */}
      {/* <p className="whitespace-pre-wrap"> */}
        {/* {finalResult.overallFeedback} */}
      {/* </p> */}
     {/* </div> */}
  </div>
)}

    </div>
  );
};

export default AIViva;
