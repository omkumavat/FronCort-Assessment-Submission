import { Router } from "express";
const router = Router();
import Page from '../Models/Page.js';
import Project from '../Models/Project.js';
import Board from '../Models/Board.js';
import Card from '../Models/Card.js';
import PageVersion from '../Models/Version.js';


router.post('/create', async (req, res) => {
  const { title, authorId, avatar } = req.body;
  const accessList = { userName: authorId, avatarUrl: avatar };
  console.log(req.body)
  const page = await Page.create({
    authorId,
    title,
    content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }] },
    accessList
  });

  res.json({ page });
});

// Get page by pageId and token
router.get('/getpagebyid/:pageId', async (req, res) => {
  const { pageId } = req.params;
  const page = await Page.findById(pageId);
  if (!page) return res.status(404).json({ error: 'Page not found' });
  res.json({ page });
});

router.get('/getall/:authorId', async (req, res) => {
  // const { pageId, token } = req.params;
  const { authorId } = req.params;
  const page = await Page.find({ authorId });
  if (!page) return res.status(404).json({ error: 'Page not found' });
  // console.log(page);

  res.json({ page });
});

router.put('/update/:pageId', async (req, res) => {
  // const { pageId, token } = req.params;
  const { pageId } = req.params;
  const { content, name, avatar } = req.body;
  const page = await Page.findById(pageId);
  if (!page) return res.status(404).json({ error: 'Page not found' });
  page.content = content;
  const existing = page.accessList.find((a) => a.userName === name);
  if (!existing) page.accessList.push({ userName: name, avatarUrl: avatar });
  // else page.accessList.push({ userName, access });
  await page.save();
  res.json({ page });
});

router.put('/manage-access/:pageId', async (req, res) => {
  const { pageId } = req.params;
  const { access } = req.body;

  const page = await Page.findById(pageId);
  if (!page) return res.status(404).json({ error: 'Page not found' });

  // const existing = page.accessList.find((a) => a.userName === userName);
  // if (existing) existing.access = access;
  // else page.accessList.push({ userName, access });

  page.access = access;
  await page.save();
  res.json({ accessList: page.accessList });
});

router.get("/search", async (req, res) => {
  try {
    const q = req.query.q?.trim();
    if (!q) return res.json([]);

    const regex = { $regex: q, $options: 'i' }; // case-insensitive pattern

    const [projects, boards, cards, pages] = await Promise.all([
      Project.find({ title: regex }).limit(10).lean(),
      Board.find({ name: regex })
        .populate('projectId', 'title')
        .limit(10)
        .lean(),
      Card.find({ title: regex })
        .populate('projectId', 'title')
        .limit(10)
        .lean(),
      Page.find({ title: regex }).limit(10).lean(),
    ]);

    const results = [
      ...projects.map((p) => ({
        _id: p._id,
        name: p.title,
        type: "project",
        route: `/project/${p._id}`,
      })),
      ...boards.map((b) => ({
        _id: b._id,
        name: b.name,
        type: "board",
        parentProject: b.projectId?.title || "Unknown Project",
        route: `/project/${b.projectId?._id || ""}`,
      })),
      ...cards.map((c) => ({
        _id: c._id,
        name: c.name,
        type: "card",
        parentProject: c.projectId?.title || "Unknown Project",
        route: `/project/${c.projectId?._id || ""}`,
      })),
      ...pages.map((p) => ({
        _id: p._id,
        name: p.title,
        type: "page",
        route: `/editor/${p._id}`,
      })),
    ];

    res.json(results);
  } catch (err) {
    console.error("Search Error:", err);
    res.status(500).json({ error: "Server error during search" });
  }
});

router.get('/fetch/versions/:pageId', async (req, res) => {
  try {
    const { pageId } = req.params;
    const versions = await PageVersion.find({ pageId }).sort({ createdAt: 1 });
    res.json({ versions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/create/version/:pageId', async (req, res) => {
  try {
    const { pageId } = req.params;
    const { content, editedBy, avatar } = req.body;
    console.log(req.body);



    const version = new PageVersion({
      pageId,
      content,
      editedBy,
      avatarUrl: avatar
    });

    await version.save();
    res.json({ success: true, version });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;