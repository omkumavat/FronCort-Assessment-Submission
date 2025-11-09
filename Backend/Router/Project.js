import { Router } from "express";
const router = Router();
import Project from "../Models/Project.js";
import Board from "../Models/Board.js";
import Page from "../Models/Page.js";
import Card from "../Models/Card.js";
import Activity from "../Models/Activity.js";

router.get('/getallmy/:user', async (req, res) => {
    const { user } = req.params;
    if (!user) return res.status(400).json({ error: 'User parameter is required' });
    try {
        const projects = await Project.find({ creator: user }).sort({ createdAt: -1 }); // newest first
        res.json(projects); // send array of projects
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

router.post('/create', async (req, res) => {
    const { name, description, creator } = req.body;

    if (!name) return res.status(400).json({ error: 'Project name is required' });

    try {
        const newProject = new Project({ creator, title: name, description });
        await newProject.save();
        res.status(201).json(newProject);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create project' });
    }
});

router.get('/getbyid/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const project = await Project.findById(id)
            .populate('pages')  // populate pages
            .populate({
                path: 'boards',    // populate boards
                populate: { path: 'cards' } // nested populate for cards inside boards
            });

        if (!project) return res.status(404).json({ error: 'Project not found' });
        res.json(project);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch project' });
    }
});

router.put("/setting/update/:id", async (req, res) => {
    try {
        const { accessList } = req.body;
        const updated = await Project.findByIdAndUpdate(
            req.params.id,
            { accessList },
            { new: true }
        );
        res.json({ message: "Access list updated", project: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/setting/fetch/:id", async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ error: 'Project not found' });

        res.json(project.accessList);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/create/page', async (req, res) => {
    const { title, projectId, authorId, avatarUrl } = req.body;
    if (!title || !projectId) return res.status(400).json({ error: 'Title and projectId required' });

    try {
        const page = new Page({
            title, project: projectId, avatarUrl, authorId, content: {
                type: 'doc',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }]
            },
        });
        await page.save();

        // Add page to project
        await Project.findByIdAndUpdate(projectId, { $push: { pages: page._id } });

        const ac = await Activity.findOne({
            $and: [{ projectId }, { userName: authorId }]
        });

        if (!ac) {
            const activity = new Activity({
                projectId,
                avatarUrl: avatarUrl,
                userName: authorId,
                projectId: projectId,
                actionType: 'user',
                target: title
            })

            await activity.save();
        }

        const acc = new Activity({
            userName: authorId,
            avatarUrl: avatarUrl,
            projectId: projectId,
            actionType: 'page_create',
            target: title
        })

        await acc.save();

        res.status(201).json(page);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create page' });
    }
});

// GET /server/pages/search?query=...
router.get("/page/search", async (req, res) => {
    try {
        const query = req.query.query || "";
        const pages = await Page.find({
            title: { $regex: query, $options: "i" },
        }).limit(10);
        res.json({ pages });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/create/board', async (req, res) => {
    const { name, projectId, creator, avatarUrl } = req.body;
    if (!name || !projectId) return res.status(400).json({ error: 'Name & projectId required' });

    try {
        const board = new Board({ name, projectId, creator });
        await board.save();
        await Project.findByIdAndUpdate(projectId, { $push: { boards: board._id } });

        const ac = await Activity.findOne({
            $and: [{ projectId }, { userName: creator }]
        });

        if (!ac) {
            const activity = new Activity({
                projectId,
                avatarUrl: avatarUrl,
                userName: creator,
                actionType: 'user',
                target: name
            })

            await activity.save();
        }

        const acc = new Activity({
            userName: creator,
            avatarUrl: avatarUrl,
            projectId: projectId,
            actionType: 'board_create',
            target: name
        })

        await acc.save();

        res.status(201).json(board);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create board' });
    }
});

router.delete('/board/delete/:boardId/:projectId', async (req, res) => {
    try {
        const { boardId, projectId } = req.params;
        const { creator, avatarUrl } = req.body;

        if (!boardId || !projectId) return res.status(400).json({ error: 'boardId & projectId required' });

        // Find board by ID
        const board = await Board.findById(boardId);
        if (!board) {
            return res.status(404).json({ message: 'Board not found' });
        }

        // Delete all cards associated with this board
        if (board.cards && board.cards.length > 0) {
            await Card.deleteMany({ _id: { $in: board.cards } });
        }

        // Delete the board itself
        await Board.findByIdAndDelete(boardId);

        Project.findByIdAndUpdate(projectId, { $pull: { boards: boardId } });

        const ac = await Activity.findOne({
            $and: [{ projectId }, { userName: creator }]
        });

        if (!ac) {
            const activity = new Activity({
                projectId,
                avatarUrl: avatarUrl,
                userName: creator,
                actionType: 'user',
                target: board.name
            })

            await activity.save();
        }

        const acc = new Activity({
            userName: creator,
            avatarUrl: avatarUrl,
            projectId: projectId,
            actionType: 'board_delete',
            target: board.name
        })

        await acc.save();

        return res.status(200).json({ message: 'Board and its cards deleted successfully' });
    } catch (error) {
        console.error('Error deleting board:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.post('/card/create', async (req, res) => {
    try {
        const {
            title,
            description,
            status,
            position,
            labels,
            dueDate,
            linkedPage,
            boardId,
            projectId,
            creator,
            avatarUrl,
        } = req.body;

        // Basic validation
        if (!title || !boardId) {
            return res.status(400).json({ message: 'Title and Board ID are required' });
        }

        // Create a new card
        const newCard = new Card({
            title,
            description,
            status,
            position,
            labels,
            dueDate,
            linkedPage,
            boardId,
            projectId,
            creator
        });

        // Save the new card
        const savedCard = await newCard.save();

        // Optionally, add this card to the board’s cards list
        if (boardId) {
            await Board.findByIdAndUpdate(
                boardId,
                { $push: { cards: savedCard._id } },
                { new: true }
            );
        }

        const ac = await Activity.findOne({
            $and: [{ projectId }, { userName: creator }]
        });

        if (!ac) {
            const activity = new Activity({
                projectId,
                avatarUrl: avatarUrl,
                userName: creator,
                actionType: 'user',
                target: title
            })

            await activity.save();
        }

        const acc = new Activity({
            userName: creator,
            avatarUrl: avatarUrl,
            projectId: projectId,
            actionType: 'card_create',
            target: title
        })

        await acc.save();

        res.status(201).json({
            message: 'Card created successfully',
            card: savedCard,
        });
    } catch (error) {
        console.error('Error creating card:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message,
        });
    }
});

router.delete('/card/delete/:cardId/:boardId', async (req, res) => {
    try {
        const { cardId, boardId } = req.params;
        const { creator, avatarUrl, projectId } = req.body;
        if (!cardId || !boardId) return res.status(400).json({ error: 'cardId required' });

        const deletedCard = await Card.findByIdAndDelete(cardId);
        if (!deletedCard) return res.status(404).json({ error: 'Card not found' });

        await Board.findByIdAndUpdate(
            boardId,
            { $pull: { cards: cardId } },
            { new: true }
        );

        const ac = await Activity.findOne({
            $and: [{ projectId }, { userName: creator }]
        });

        if (!ac) {
            const activity = new Activity({
                projectId,
                avatarUrl: avatarUrl,
                userName: creator,
                actionType: 'user',
                target: deletedCard.title
            })

            await activity.save();
        }

        const acc = new Activity({
            userName: creator,
            avatarUrl: avatarUrl,
            projectId: projectId,
            actionType: 'card_delete',
            target: deletedCard.title
        })

        await acc.save();

        res.status(201).json({
            message: 'Card deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting card:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message,
        });
    }
});


router.put('/card/reorder', async (req, res) => {
    const { projectId, avatarUrl, creator, orderedCardIds, cardId } = req.body;

    try {
        // Update positions in DB
        for (let i = 0; i < orderedCardIds.length; i++) {
            await Card.findByIdAndUpdate(orderedCardIds[i], { position: i });
        }

        const card = await Card.findById(cardId);
        if (!card) return res.status(404).json({ error: 'Card not found' });

        const ac = await Activity.findOne({
            $and: [{ projectId }, { userName: creator }]
        });

        if (!ac) {
            const activity = new Activity({
                projectId,
                avatarUrl: avatarUrl,
                userName: creator,
                actionType: 'user',
                target: card.title
            })

            await activity.save();
        }

        const acc = new Activity({
            userName: creator,
            avatarUrl: avatarUrl,
            projectId: projectId,
            actionType: 'card_move',
            target: card.title
        })

        await acc.save();

        res.status(200).json({ message: "Cards reordered successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to reorder cards" });
    }
});

router.put('/card/edit/:cardId', async (req, res) => {
    try {
        const { cardId } = req.params;
        const cardData = req.body;
        const { projectId, creator, avatarUrl } = req.body;

        const card = await Card.findById(cardId);
        if (!card) {
            return res.status(404).json({ message: 'Card not found' });
        }
        card.title = cardData.title || card.title;
        card.description = cardData.description || card.description;
        card.status = cardData.status || card.status;
        card.position = cardData.position || card.position;
        card.labels = cardData.labels || card.labels;
        card.dueDate = cardData.dueDate || card.dueDate;
        card.linkedPage = cardData.linkedPage || card.linkedPage;

        await card.save();

        const ac = await Activity.findOne({
            $and: [{ projectId }, { userName: creator }]
        });

        if (!ac) {
            const activity = new Activity({
                projectId,
                avatarUrl: avatarUrl,
                userName: creator,
                actionType: 'user',
                target: cardData.title
            })

            await activity.save();
        }

        const acc = new Activity({
            userName: creator,
            avatarUrl: avatarUrl,
            projectId: projectId,
            actionType: 'card_edit',
            target: cardData.title
        })

        await acc.save();

        res.status(200).json({ message: 'Card updated successfully', card });
    } catch (error) {
        console.error('Error updating card:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.put('/card/page/link-page/:cardId', async (req, res) => {
    const { pageId, pageName, creator, avatarUrl, projectId } = req.body;
    const { cardId } = req.params;
    if (!cardId || !pageId || !pageName) return res.status(400).json({ error: 'cardId & pageId required' });

    try {
        const card = await Card.findById(cardId);
        if (!card) return res.status(404).json({ error: 'Card not found' });
        card.linkedPage.pageId = pageId;
        card.linkedPage.pageName = pageName;
        await card.save();

        const ac = await Activity.findOne({
            $and: [{ projectId }, { userName: creator }]
        });

        if (!ac) {
            const activity = new Activity({
                projectId,
                avatarUrl: avatarUrl,
                userName: creator,
                actionType: 'user',
                target: pageName
            })

            await activity.save();
        }

        const acc = new Activity({
            userName: creator,
            avatarUrl: avatarUrl,
            projectId: projectId,
            actionType: 'page_link',
            target: pageName
        })

        await acc.save();

        res.status(201).json(card);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create card' });
    }
});

router.get('/activity/fetch/:projectId', async (req, res) => {
    const { projectId } = req.params;

    try {
        let acc;
        if (projectId === null || projectId === 'null') {
            acc = await Activity.find().sort({ createdAt:1 }).limit(50);
            if (!acc) return res.status(404).json({ error: 'Activity not found' });
        } else {
            acc = await Activity.find({ projectId }).sort({ createdAt: -1 }).limit(20);
            if (!acc) return res.status(404).json({ error: 'Activity not found' });
        }

        res.status(201).json(acc);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create card' });
    }
});





export default router

