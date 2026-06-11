const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Chart of Accounts
router.get('/accounts', authenticate, async (req, res) => {
  try {
    const accounts = await prisma.account.findMany({
      include: { children: true },
      orderBy: { accountCode: 'asc' }
    });

    res.json({ success: true, data: accounts });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Journal Entries
router.get('/journal-entries', authenticate, async (req, res) => {
  try {
    const entries = await prisma.journalEntry.findMany({
      include: {
        lines: {
          include: { account: { select: { accountCode: true, accountName: true } } }
        },
        creator: { select: { firstName: true, lastName: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json({ success: true, data: entries });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.post('/journal-entries', authenticate, async (req, res) => {
  try {
    const { date, reference, lines } = req.body;

    const totalDebit = lines.reduce((sum, l) => sum + (parseFloat(l.debit) || 0), 0);
    const totalCredit = lines.reduce((sum, l) => sum + (parseFloat(l.credit) || 0), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return res.status(400).json({
        success: false,
        error: { message: 'Journal entry must balance: Total Debits = Total Credits' }
      });
    }

    const count = await prisma.journalEntry.count();
    const entry = await prisma.journalEntry.create({
      data: {
        entryNumber: `JE-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`,
        date: new Date(date),
        reference,
        totalDebit,
        totalCredit,
        createdBy: req.user.id,
        lines: {
          create: lines.map(l => ({
            accountId: l.accountId,
            description: l.description,
            debit: parseFloat(l.debit) || 0,
            credit: parseFloat(l.credit) || 0
          }))
        }
      },
      include: {
        lines: { include: { account: true } },
        creator: { select: { firstName: true, lastName: true } }
      }
    });

    res.json({ success: true, data: entry });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Trial Balance
router.get('/trial-balance', authenticate, async (req, res) => {
  try {
    const accounts = await prisma.account.findMany({
      where: { isActive: true },
      include: {
        debitLines: true,
        creditLines: true
      }
    });

    const trialBalance = accounts.map(acc => {
      const totalDebit = acc.debitLines.reduce((sum, l) => sum + parseFloat(l.debit), 0);
      const totalCredit = acc.creditLines.reduce((sum, l) => sum + parseFloat(l.credit), 0);
      const balance = totalDebit - totalCredit;

      return {
        accountCode: acc.accountCode,
        accountName: acc.accountName,
        accountType: acc.accountType,
        debit: totalDebit,
        credit: totalCredit,
        balance: balance
      };
    }).filter(acc => acc.debit > 0 || acc.credit > 0);

    const totalDebits = trialBalance.reduce((sum, acc) => sum + acc.debit, 0);
    const totalCredits = trialBalance.reduce((sum, acc) => sum + acc.credit, 0);

    res.json({
      success: true,
      data: {
        accounts: trialBalance,
        totals: { debit: totalDebits, credit: totalCredits }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Profit & Loss
router.get('/profit-loss', authenticate, async (req, res) => {
  try {
    const { year = new Date().getFullYear(), month } = req.query;

    const where = {
      isPosted: true,
      date: {
        gte: new Date(year, month ? month - 1 : 0, 1),
        lt: month ? new Date(year, month, 1) : new Date(parseInt(year) + 1, 0, 1)
      }
    };

    const entries = await prisma.journalEntry.findMany({
      where,
      include: {
        lines: {
          include: { account: true }
        }
      }
    });

    let revenue = 0, cogs = 0, expenses = 0;

    entries.forEach(entry => {
      entry.lines.forEach(line => {
        const amount = parseFloat(line.debit) - parseFloat(line.credit);
        if (line.account.accountType === 'revenue') revenue += amount * -1;
        else if (line.account.accountType === 'expense') {
          if (line.account.accountCode.startsWith('5')) cogs += amount;
          else expenses += amount;
        }
      });
    });

    const grossProfit = revenue - cogs;
    const netProfit = grossProfit - expenses;

    res.json({
      success: true,
      data: {
        revenue,
        cogs,
        grossProfit,
        expenses,
        netProfit,
        period: month ? `${year}-${String(month).padStart(2, '0')}` : year
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Bank Accounts
router.get('/bank-accounts', authenticate, async (req, res) => {
  try {
    const accounts = await prisma.bankAccount.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: accounts });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Payroll
router.get('/payroll', authenticate, async (req, res) => {
  try {
    const periods = await prisma.payrollPeriod.findMany({
      include: {
        _count: { select: { entries: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: periods });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

module.exports = router;
