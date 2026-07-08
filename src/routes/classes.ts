import { and, desc, eq, getTableColumns, ilike, or, sql, type SQL } from "drizzle-orm";
import express from "express";
import { classes, departments, enrollments, subjects, user } from "../db/schema/index.js";
import { db } from "../db/index.js";

const router = express.Router();
router.use((req, _res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
});

router.get("/", async (req, res) => {
    try {
        const { search, subject, teacher, page = 1, limit = 10 } = req.query;

        const MAX_LIMIT = 100;
        const parsedPage = Number(page);
        const parsedLimit = Number(limit);
        const currentPage = Number.isFinite(parsedPage) ? Math.max(1, Math.trunc(parsedPage)) : 1;
        const limitPerPage = Number.isFinite(parsedLimit)
            ? Math.min(MAX_LIMIT, Math.max(1, Math.trunc(parsedLimit)))
            : 10;
        const offset = (currentPage - 1) * limitPerPage;

        const filterConditions = [];

        if (search) {
            filterConditions.push(
                or(
                    ilike(classes.name, `%${search}%`),
                    ilike(classes.inviteCode, `%${search}%`)
                )
            );
        }

        if (subject) {
            filterConditions.push(ilike(subjects.name, `%${subject}%`));
        }

        if (teacher) {
            filterConditions.push(ilike(user.name, `%${teacher}%`));
        }

        const whereClause = filterConditions.length > 0 ? and(...filterConditions) : undefined;

        const countResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(classes)
            .leftJoin(subjects, eq(classes.subjectId, subjects.id))
            .leftJoin(user, eq(classes.teacherId, user.id))
            .where(whereClause);

        const totalCount = countResult[0]?.count ?? 0;

        const classesList = await db
            .select({
                ...getTableColumns(classes),
                subject: { ...getTableColumns(subjects) },
                teacher: { ...getTableColumns(user) }
            })
            .from(classes)
            .leftJoin(subjects, eq(classes.subjectId, subjects.id))
            .leftJoin(user, eq(classes.teacherId, user.id))
            .where(whereClause)
            .orderBy(desc(classes.createdAt))
            .offset(offset)
            .limit(limitPerPage);

        res.status(200).json({
            data: classesList,
            pagination: {
                page: currentPage,
                limit: limitPerPage,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limitPerPage)
            }
        });
    } catch (error) {
        console.error("Error fetching classes:", error);
        res.status(500).json({ error: "Failed to get Classes" });
    }
});

router.post("/", async (req, res) => {
    try {
        const { name, teacherId, subjectId, capacity, description, status, bannerUrl, bannerCldPubId } = req.body;

        const [createdClass] = await db
            .insert(classes)
            .values({
                ...req.body,
                inviteCode: Math.random().toString(36).substring(2, 9),
                schedules: []
            })
            .returning({ id: classes.id });
        if (!createdClass) throw Error;
        res.status(200).json({ createdClass });
    } catch (e) {
        console.error(`POST / Classes error ${e}`);
        res.status(500).json({ error: e });
    }
});


//gets the class details with department details

router.get('/:id/users', async (req, res) => {
    try {
        const classId = Number(req.params.id);

        if (!Number.isFinite(classId)) {
            return res.status(400).json({ error: 'No Class Found' });
        }

        const { search, role, page = 1, limit = 10 } = req.query;

        const MAX_LIMIT = 100;
        const parsedPage = Number(page);
        const parsedLimit = Number(limit);
        const currentPage = Number.isFinite(parsedPage) ? Math.max(1, Math.trunc(parsedPage)) : 1;
        const limitPerPage = Number.isFinite(parsedLimit)
            ? Math.min(MAX_LIMIT, Math.max(1, Math.trunc(parsedLimit)))
            : 10;
        const offset = (currentPage - 1) * limitPerPage;

        const filterConditions: SQL[] = [eq(enrollments.classId, classId)];

        if (typeof search === "string" && search.trim()) {
            const searchCondition = or(
                ilike(user.name, `%${search.trim()}%`),
                ilike(user.email, `%${search.trim()}%`)
            );

            if (searchCondition) {
                filterConditions.push(searchCondition);
            }
        }

        const requestedRole = typeof role === "string" && (role === "student" || role === "teacher" || role === "admin")
            ? role
            : undefined;

        if (requestedRole) {
            filterConditions.push(eq(user.role, requestedRole));
        }

        const whereClause = and(...filterConditions);

        const countResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(enrollments)
            .innerJoin(user, eq(enrollments.studentId, user.id))
            .where(whereClause);

        const totalCount = countResult[0]?.count ?? 0;

        const students = await db
            .select({
                ...getTableColumns(user)
            })
            .from(enrollments)
            .innerJoin(user, eq(enrollments.studentId, user.id))
            .where(whereClause)
            .orderBy(desc(user.createdAt))
            .offset(offset)
            .limit(limitPerPage);

        res.status(200).json({
            data: students,
            pagination: {
                page: currentPage,
                limit: limitPerPage,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limitPerPage)
            }
        });
    } catch (error) {
        console.error("Error fetching class users:", error);
        res.status(500).json({ error: "Failed to get class users" });
    }
});

router.get('/:id', async (req, res) => {
    const classId = Number(req.params.id);

    if (!Number.isFinite(classId)) return res.status(400).json({ error: 'No Class Found' });

    const [classDetails] = await db.select({
        ...getTableColumns(classes),
        subject: { ...getTableColumns(subjects) },
        department: { ...getTableColumns(departments) },
        teacher: { ...getTableColumns(user) },
    }).from(classes).leftJoin(subjects, eq(classes.subjectId, subjects.id))
        .leftJoin(departments, eq(subjects.departmentId, departments.id))
        .leftJoin(user, eq(classes.teacherId, user.id))
        .where(eq(classes.id, classId));

    if (!classDetails) return res.status(400).json({ error: 'No Class Found' });
    res.status(200).json({ data: classDetails });
});

export default router;

