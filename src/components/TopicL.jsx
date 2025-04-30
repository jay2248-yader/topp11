import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";
import "./TopicL.css";

import { useNavigate } from "react-router-dom";

function TopicL() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clickCount, setClickCount] = useState(0);
  const navigate = useNavigate(); // For navigation



  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const topicsSnapshot = await getDocs(collection(db, "topics"));
        const topicsData = topicsSnapshot.docs.map((docItem) => ({
          id: docItem.id,
          ...docItem.data(),
        }));

        // Fetch all groups in one go
        const groupsSnapshot = await getDocs(collection(db, "groups"));
        const topicGroupMap = {};

        groupsSnapshot.docs.forEach((groupDoc) => {
          const groupData = groupDoc.data();
          const topicId = groupData.topicId?.id || groupData.topicId; // for DocumentReference or string
          if (topicId) {
            topicGroupMap[topicId] = (topicGroupMap[topicId] || 0) + 1;
          }
        });

        const mergedData = topicsData.map((topic) => ({
          ...topic,
          groupCount: topicGroupMap[topic.id] || 0,
        }));

        setTopics(mergedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  
  const handleTitleClick = () => {
    setClickCount((prevCount) => prevCount + 1);
    
    if (clickCount + 1 === 5) {
      // Redirect to login page after 5 clicks
      navigate("/login");
    }
  };

  if (loading)
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>ກຳລັງໂຫຼດຫົວຂໍ້...</p>
      </div>
    );

  return (
    <div className="page-container">
     <h1
        className="page-title"
        onClick={handleTitleClick}
      >
        ຫົວຂໍ້ທັງຫມົດ
      </h1>
      <p className="page-subtitle">ເລືອກຫົວຂໍ້ທີ່ສົນໃຈ ແລະ ຕ້ອງການ</p>

      <div className="topic-grid">
        {topics.map((topic) => {
          const isFull = topic.groupCount >= topic.maxGroups;
          const isInactive = topic.status === "inactive";
          return (
            <div
              key={topic.id}
              className={`topic-card ${isInactive ? "unavailable" : ""} ${
                isFull ? "full" : ""
              }`}
            >
              <div className="topic-header">
                <h2>{topic.name}</h2>
                {topic.isPopular && (
                  <span className="popular-badge">ยอดนิยม</span>
                )}
              </div>

              <div className="topic-content">
                {topic.description && (
                  <p className="topic-description">{topic.description}</p>
                )}
                <div className="topic-stats">
                  <div className="topic-stat">
                    <span className="stat-label">ສະຫມັກແລ້ວ</span>
                    <div className="stat-value">
                      <div className="progress-container">
                        <div
                          className="progress-bar"
                          style={{
                            width: `${
                              (topic.groupCount / topic.maxGroups) * 100
                            }%`,
                          }}
                        />
                      </div>
                      <span>
                        {topic.groupCount}/{topic.maxGroups} ກຸ່ມ
                      </span>
                    </div>
                  </div>
                  <div className="topic-stat">
                    <span className="stat-label">ສະມາຊິກຕໍ່ກຸ່ມ</span>
                    <span className="stat-value">
                      {topic.membersPerGroup} ຄົນ
                    </span>
                  </div>
                </div>
              </div>

              <div className="topic-footer">
                {isInactive && (
                  <div className="status-badge closed">ປິດຮັບສະໝັກ</div>
                )}
                {isFull && !isInactive && (
                  <div className="status-badge full">ເຕັມ</div>
                )}
                {!isInactive && (
                  <Link to={`/topics/${topic.id}`} className="view-button">
                    {isFull ? "ເບິ່ງລາຍລະອຽດ" : "ສະຫມັກ"}
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {topics.length === 0 && (
        <div className="empty-state">
          <p>ບໍ່ພົບຫົວຂໍ້ໃຫ້ເປີດລົງທະບຽນ</p>
        </div>
      )}
    </div>
  );
}

export default TopicL;
