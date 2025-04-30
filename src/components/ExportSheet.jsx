import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where, doc } from 'firebase/firestore';
import { Link } from 'react-router-dom'; // 👉 เพิ่มการ import
import { db } from '../firebase';
import './ExportSheet.css';

function ExportSheet() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const topicsSnapshot = await getDocs(collection(db, 'topics'));
      const topicsData = topicsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      const topicsWithGroups = await Promise.all(
        topicsData.map(async topic => {
          const groupsQuery = query(
            collection(db, 'groups'),
            where('topicId', '==', doc(db, 'topics', topic.id))
          );
          const groupsSnapshot = await getDocs(groupsQuery);
          const groups = groupsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          return { ...topic, groups };
        })
      );

      setTopics(topicsWithGroups);
    } catch (err) {
      setError('ເກີດຂໍໍ້ຜິດພາດ: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const exportToCSV = () => {
    let csvContent = '';

    topics.forEach(topic => {
      const totalGroups = topic.groups.length;
      const membersPerGroup = topic.groups.reduce((max, group) => {
        return group.members?.length > max ? group.members.length : max;
      }, 0);

      csvContent += `ຊື່ຫົວຂໍ້:,${topic.name}\n`;
      csvContent += `ຈຳນວນກຸ່ມສູງສຸດ:,${totalGroups}\n`;
      csvContent += `ຈຳນວນສະມາຊິກຕໍ່ກຸ່ມ:,${membersPerGroup}\n\n`;

      topic.groups.forEach((group, index) => {
        const members = group.members?.join(', ') || '';
        csvContent += `ກຸ່ມທີ ${index + 1}:,${members}\n`;
      });

      csvContent += `\n\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'group_export.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <p className="export-page__loading">⏳ ກຳລັງໂຫຼດຂໍ້ມູນ...</p>;
  }

  if (error) {
    return (
      <div className="export-page__error">
        <p>❌ {error}</p>
        <button className="export-page__retry-button" onClick={fetchData}>ລອງອີກຄັ້ງ</button>
      </div>
    );
  }

  return (
    <div className="export-page__container">
      {/* 🔙 ปุ่มกลับหน้าหลัก */}
      <Link to="/topp8/admin" className="manage-topics-back-btn">
        &larr; ກັບໜ້າຫຼັກ
      </Link>

      <h1 className="export-page__title">📤 ສົ່ງອອກຂໍ້ມູນກຸ່ມ</h1>
      <button className="export-page__download-button" onClick={exportToCSV}>⬇ ດາວໂຫລດ CSV</button>

      <div className="export-page__preview">
        <h2 className="export-page__subtitle">🔍 ພີວິວຂໍ້ມູນ</h2>
        {topics.map(topic => (
          <div key={topic.id} className="export-page__topic">
            <h3 className="export-page__topic-name">{topic.name}</h3>
            <p className="export-page__group-info">ຈຳນວນກຸ່ມສູງສຸດ: {topic.groups.length}</p>
            <p className="export-page__group-info">
              ຈຳນວນສະມາຊິກຕໍ່ກຸ່ມ: {Math.max(...topic.groups.map(g => g.members?.length || 0))}
            </p>
            <ul className="export-page__group-list">
              {topic.groups.map((group, idx) => (
                <li key={group.id} className="export-page__group-item">
                  ກຸ່ມທີ {idx + 1}: {group.members?.join(', ') || 'ບໍ່ມີສະມາຊິກ'}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ExportSheet;
