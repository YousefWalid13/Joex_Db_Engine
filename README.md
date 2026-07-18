MiniDB (Joex)- Custom Database Engine

Features:
- Persistent Storage
- MemTable
- SSTable
- LSM Tree
- WAL Recovery
- Indexing
- Compaction
- TCP Server
- Custom Query Language

Tech:
File Systems,
Data Structures, Concurrency


# step 1
    - Persistent Storage: Data is stored on disk to ensure durability and persistence across sessions.
# step 2
    - MemTable: An in-memory data structure that holds recent writes before they are flushed to disk.
    SET
     ↓
    MemTable
     ↓ (عند الامتلاء)
    Flush
     ↓
    SSTable










    Controller
    ↓
Database
    ↓
WAL
    ↓
MemTable
    ↓
Flush
    ↓
SSTable
    ↓
Sparse Index
    ↓
Compaction